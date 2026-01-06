import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/utils/cookies'
import { cn } from '@admin/lib/utils'
import { LayoutProvider } from '@admin/context/layout-provider'
import { SearchProvider } from '@admin/context/search-provider'
import { SidebarInset, SidebarProvider } from '@admin/components/ui/sidebar'
import { AppSidebar } from '@admin/components/layout/app-sidebar'
import { SkipToMain } from '@admin/components/skip-to-main'
import { Header } from '@admin/components/layout/header'
import { Search } from '@admin/components/search'
import { ThemeSwitch } from '@/components/common/ThemeSwitch'
import { ConfigDrawer } from '@admin/components/config-drawer'
import { ProfileDropdown } from '@admin/components/profile-dropdown'
import { AdminNotificationBell } from '@admin/components/admin-notification-bell'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {/* Shared header with notification bell - appears on ALL pages */}
            <Header>
              <Search />
              <div className="ms-auto flex items-center space-x-4">
                <AdminNotificationBell />
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
              </div>
            </Header>
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}

