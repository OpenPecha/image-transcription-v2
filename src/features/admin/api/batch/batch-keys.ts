export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...batchKeys.lists(), filters] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  reports: () => [...batchKeys.all, 'report'] as const,
  report: (id: string) => [...batchKeys.reports(), id] as const,
  applicationReports: () => [...batchKeys.all, 'application-report'] as const,
  applicationReport: (applicationName: string) =>
    [...batchKeys.applicationReports(), applicationName] as const,
  tasks: (batchId: string, filter?: { state?: string; userId?: string }) =>
    [...batchKeys.all, 'tasks', batchId, filter?.state ?? 'all', filter?.userId ?? 'all'] as const,
  groupUsers: (batchId: string) => [...batchKeys.all, 'group-users', batchId] as const,
  taskSearch: (applicationName: string, query: string) =>
    [...batchKeys.all, 'task-search', applicationName, query] as const,
}

