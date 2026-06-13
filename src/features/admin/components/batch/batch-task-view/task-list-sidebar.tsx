import { useTranslation } from 'react-i18next'
import { TaskFileName } from '@/components/common'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { BATCH_STATS_CONFIG, type BatchTask, type BatchTaskState } from '@/types'

interface TaskListSidebarProps {
  tasks: BatchTask[]
  selectedTaskId: string | null
  onSelectTask: (task: BatchTask) => void
  isLoading: boolean
}

export function TaskListSidebar({
  tasks,
  selectedTaskId,
  onSelectTask,
  isLoading,
}: TaskListSidebarProps) {
  const { t } = useTranslation('admin')

  if (isLoading) {
    return (
      <div className="flex flex-col h-full border-r border-border bg-card">
        <div className="p-3 border-b border-border">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{t('batches.taskList')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            {t('batches.noTasksFound')}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskListItem
              key={task.task_id}
              task={task}
              isSelected={task.task_id === selectedTaskId}
              onClick={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TaskListItemProps {
  task: BatchTask
  isSelected: boolean
  onClick: () => void
}

function TaskListItem({ task, isSelected, onClick }: TaskListItemProps) {
  const stateConfig = BATCH_STATS_CONFIG[task.state as BatchTaskState]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
        'hover:bg-accent/50',
        isSelected
          ? 'bg-accent text-accent-foreground ring-1 ring-primary/20'
          : 'text-foreground'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <TaskFileName
          fileName={task.task_name}
          className="flex-1 min-w-0"
          textClassName="text-foreground"
          expanded={isSelected}
          showCopyButton={isSelected}
          showExpandToggle={false}
          enableContextMenu
        />
        <span
          className={cn(
            'shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium',
            stateConfig?.color || 'bg-muted text-muted-foreground'
          )}
        >
          {stateConfig?.label || task.state}
        </span>
      </div>
    </button>
  )
}

export function TaskListSidebarSkeleton() {
  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="p-3 border-b border-border">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}

