import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@admin/components/config-drawer'
import { Header } from '@admin/components/layout/header'
import { ProfileDropdown } from '@admin/components/profile-dropdown'
import { Search } from '@admin/components/search'
import { ThemeSwitch } from '@admin/components/theme-switch'
import { ForbiddenError } from '@admin/features/errors/forbidden'
import { GeneralError } from '@admin/features/errors/general-error'
import { MaintenanceError } from '@admin/features/errors/maintenance-error'
import { NotFoundError } from '@admin/features/errors/not-found-error'
import { UnauthorisedError } from '@admin/features/errors/unauthorized-error'

export const Route = createFileRoute('/admin/_authenticated/errors/$error')({
  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    unauthorized: UnauthorisedError,
    forbidden: ForbiddenError,
    'not-found': NotFoundError,
    'internal-server-error': GeneralError,
    'maintenance-error': MaintenanceError,
  }
  const ErrorComponent = errorMap[error] || NotFoundError

  return (
    <>
      <Header fixed className='border-b'>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <div className='flex-1 [&>div]:h-full'>
        <ErrorComponent />
      </div>
    </>
  )
}
