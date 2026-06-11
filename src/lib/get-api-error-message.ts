import axios from 'axios'

type ApiErrorBody = {
  detail?: unknown
  error?: unknown
  message?: unknown
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }
  return undefined
}

function formatDetailValue(detail: unknown): string | undefined {
  const direct = asNonEmptyString(detail)
  if (direct) return direct

  if (!Array.isArray(detail)) return undefined

  const messages = detail
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        return asNonEmptyString(record.msg) ?? asNonEmptyString(record.message)
      }
      return undefined
    })
    .filter((value): value is string => Boolean(value))

  return messages.length > 0 ? messages.join('. ') : undefined
}

function extractFromBody(data: unknown): string | undefined {
  if (asNonEmptyString(data)) return asNonEmptyString(data)

  if (!data || typeof data !== 'object') return undefined

  const body = data as ApiErrorBody

  return (
    asNonEmptyString(body.error) ??
    asNonEmptyString(body.message) ??
    formatDetailValue(body.detail)
  )
}

export function getApiErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (axios.isAxiosError(error)) {
    const fromBody = extractFromBody(error.response?.data)
    if (fromBody) return fromBody

    const statusMessage = asNonEmptyString(error.message)
    if (statusMessage && !/^Request failed with status code \d+$/.test(statusMessage)) {
      return statusMessage
    }

    return fallback
  }

  const fromBody = extractFromBody(error)
  if (fromBody) return fromBody

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
