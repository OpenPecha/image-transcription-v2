import { isAxiosError } from 'axios'

function getApiErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined

  const data = error.response?.data
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error: unknown }).error
    return typeof message === 'string' ? message : undefined
  }
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    return typeof detail === 'string' ? detail : undefined
  }

  return undefined
}

function isWrongApplicationError(message: string): boolean {
  return /belongs to application/i.test(message)
}

function isInvalidDateRangeError(message: string): boolean {
  return /start_date|end_date|date range|invalid date/i.test(message)
}

export function getContributionSummaryErrorMessage(
  error: unknown,
  t: (key: string) => string
): string {
  const status = isAxiosError(error) ? error.response?.status : undefined
  const apiMessage = getApiErrorMessage(error) ?? ''

  if (status === 404) {
    return t('userContributions.groupNotFound')
  }

  if (apiMessage && isWrongApplicationError(apiMessage)) {
    return t('userContributions.featureNotImplementedForGroup')
  }

  if (
    status === 400 ||
    (status === 422 && apiMessage && isInvalidDateRangeError(apiMessage))
  ) {
    return t('userContributions.invalidDateRange')
  }

  if (status === 422) {
    return t('userContributions.featureNotImplementedForGroup')
  }

  return t('userContributions.featureNotImplementedForGroup')
}
