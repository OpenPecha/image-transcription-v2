const LOG_PREFIX = '[TiffImage]'

type LogData = Record<string, unknown>

function log(stage: string, data: LogData) {
  if (!import.meta.env.DEV) return
  console.log(`${LOG_PREFIX} ${stage}`, data)
}

function formatError(error: unknown): LogData {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  return { value: String(error) }
}

export const tiffImageLog = {
  useEffect(data: { imageUrl: string; isTiff: boolean; proxiedUrl: string }) {
    log('useEffect', data)
  },

  fetchStart(data: { url: string; seq: number }) {
    log('fetch start', data)
  },

  fetchDone(data: { status: number; contentType: string | null; byteSize: number }) {
    log('fetch done', data)
  },

  magicBytes(data: { isTiff: boolean; first4BytesHex: string }) {
    log('magic bytes', data)
  },

  utifDecode(data: { pageCount: number }) {
    log('UTIF.decode', data)
  },

  decodeImage(data: { width: number; height: number }) {
    log('decodeImage', data)
  },

  toRGBA8(data: { bufferLength: number }) {
    log('toRGBA8', data)
  },

  canvas(data: { blobSize: number }) {
    log('canvas', data)
  },

  setDisplayUrl(data: { path: 'tiff-blob-url' | 'proxied-url' }) {
    log('setDisplayUrl', data)
  },

  catch(data: { stage: string; error: unknown }) {
    if (!import.meta.env.DEV) return
    console.error(`${LOG_PREFIX} catch`, {
      stage: data.stage,
      error: formatError(data.error),
    })
  },

  imageCanvas(data: { branch: 'loading' | 'converting' | 'error' | 'null' | 'img' }) {
    log('ImageCanvas', data)
  },

  imgLoad(data: { src: string }) {
    log('<img> onLoad', data)
  },

  imgError(data: { src: string }) {
    log('<img> onError', data)
  },
}
