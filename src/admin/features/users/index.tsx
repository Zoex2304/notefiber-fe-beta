import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@admin/components/layout/main'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useUsers } from './hooks/use-users'
import type { UserListParams } from '@admin/lib/types/admin-api'
import type { NavigateFn } from '@admin/hooks/use-table-url-state'


const route = getRouteApi('/admin/_authenticated/users/')

export function Users() {

  const search = route.useSearch() as UserListParams
  const navigate = route.useNavigate() as NavigateFn

  // safely cast search params
  const queryParams: UserListParams = {
    page: search.page || 1,
    limit: search.limit || 10,
    q: search.q || undefined,
  }

  const { data: users = [], isLoading } = useUsers(queryParams)

  return (
    <UsersProvider>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} isLoading={isLoading} search={search} navigate={navigate} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
