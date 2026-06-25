import { useState, useEffect, useRef, type MutableRefObject } from 'react'
import * as UTIF from 'utif2'

import { tiffImageLog } from '@/features/workspace/utils/tiff-image-debug-log'

type LoadContext = {
  seq: number
  signal: AbortSignal
}

export function useTiffImage(imageUrl: string) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestSeq = useRef(0)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      revokeStoredObjectUrl(objectUrlRef)
      setDisplayUrl(null)
      setIsConverting(false)
      setError(null)
      return
    }

    const proxiedUrl = getProxiedUrl(imageUrl)
    const isTiff = isTiffUrl(imageUrl)
    tiffImageLog.useEffect({ imageUrl, isTiff, proxiedUrl })

    if (!isTiff) {
      revokeStoredObjectUrl(objectUrlRef)
      setDisplayUrl(proxiedUrl)
      setIsConverting(false)
      setError(null)
      tiffImageLog.setDisplayUrl({ path: 'proxied-url' })
      return
    }

    const seq = ++requestSeq.current
    const controller = new AbortController()

    async function loadTiffImage(url: string, ctx: LoadContext) {
      setIsConverting(true)
      setError(null)
      setDisplayUrl(null)

      let stage = 'fetchStart'

      try {
        tiffImageLog.fetchStart({ url, seq: ctx.seq })

        const response = await fetch(url, {
          signal: ctx.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch image: HTTP ${response.status}`)
        }

        const buffer = await response.arrayBuffer()

        if (ctx.seq !== requestSeq.current) return

        stage = 'fetchDone'
        tiffImageLog.fetchDone({
          status: response.status,
          contentType: response.headers.get('content-type'),
          byteSize: buffer.byteLength,
        })

        stage = 'magicBytes'
        const first4BytesHex = getFirst4BytesHex(buffer)
        const isTiffBufferResult = isTiffBuffer(buffer)
        tiffImageLog.magicBytes({ isTiff: isTiffBufferResult, first4BytesHex })

        if (!isTiffBufferResult) {
          throw new Error(`Invalid TIFF signature: ${first4BytesHex}`)
        }

        stage = 'decodeTiffToObjectUrl'
        const objectUrl = await decodeTiffToObjectUrl(buffer, (nextStage) => {
          stage = nextStage
        })

        if (ctx.seq !== requestSeq.current) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        revokeStoredObjectUrl(objectUrlRef)
        objectUrlRef.current = objectUrl
        setDisplayUrl(objectUrl)
        tiffImageLog.setDisplayUrl({ path: 'tiff-blob-url' })
      } catch (err) {
        if (ctx.signal.aborted) return
        if (ctx.seq !== requestSeq.current) return

        setDisplayUrl(null)
        setError('Failed to load image')
        tiffImageLog.catch({ stage, error: err })
      } finally {
        if (ctx.seq === requestSeq.current) {
          setIsConverting(false)
        }
      }
    }

    loadTiffImage(proxiedUrl, { seq, signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [imageUrl])

  useEffect(() => {
    return () => {
      revokeStoredObjectUrl(objectUrlRef)
    }
  }, [])

  return { displayUrl, isConverting, error }
}

async function decodeTiffToObjectUrl(
  buffer: ArrayBuffer,
  onStageChange: (stage: string) => void,
): Promise<string> {
  onStageChange('utifDecode')
  const ifds = UTIF.decode(buffer)
  tiffImageLog.utifDecode({ pageCount: ifds.length })

  if (ifds.length === 0) {
    throw new Error('No pages found in TIFF file')
  }

  onStageChange('decodeImage')
  UTIF.decodeImage(buffer, ifds[0])
  const firstPage = ifds[0]
  tiffImageLog.decodeImage({ width: firstPage.width, height: firstPage.height })

  onStageChange('toRGBA8')
  const rgba = UTIF.toRGBA8(firstPage)
  tiffImageLog.toRGBA8({ bufferLength: rgba.length })

  onStageChange('canvas')
  const canvas = document.createElement('canvas')
  canvas.width = firstPage.width
  canvas.height = firstPage.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const imageData = ctx.createImageData(firstPage.width, firstPage.height)
  imageData.data.set(rgba)
  ctx.putImageData(imageData, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png')
  })

  if (!blob) {
    throw new Error('Failed to create PNG blob')
  }

  tiffImageLog.canvas({ blobSize: blob.size })

  return URL.createObjectURL(blob)
}

function revokeStoredObjectUrl(objectUrlRef: MutableRefObject<string | null>) {
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
  }
}

function getFirst4BytesHex(buffer: ArrayBuffer): string {
  if (buffer.byteLength === 0) return ''
  const bytes = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
}

function isTiffUrl(url: string): boolean {
  return url.endsWith('.tiff') || url.endsWith('.tif') || url.endsWith('.TIFF') || url.endsWith('.TIF')
}

function isTiffBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false

  const bytes = new Uint8Array(buffer, 0, 4)

  const isLittleEndian =
    bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00

  const isBigEndian =
    bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a

  return isLittleEndian || isBigEndian
}

function getProxiedUrl(url: string): string {
  if (import.meta.env.DEV && url.includes('s3.us-east-1.amazonaws.com')) {
    return url.replace('https://s3.us-east-1.amazonaws.com', '/s3-proxy')
  }
  return url
}
