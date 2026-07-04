import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/use-ui-store'
import { Sidebar } from './sidebar'

export function MainLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen min-w-0 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className="container mx-auto min-w-0 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

