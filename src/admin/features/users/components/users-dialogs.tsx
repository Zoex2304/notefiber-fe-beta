import { CreateUserDialog } from './create-user-dialog'
import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersPurgeDialog } from './users-purge-dialog'
import { UsersStatusDialog } from './users-status-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <CreateUserDialog
        key='user-create'
        open={open === 'create-user'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create-user' : null)}
      />

      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersStatusDialog
            key={`user-status-${currentRow.id}`}
            open={open === 'edit-status'}
            onOpenChange={() => {
              setOpen('edit-status')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersPurgeDialog
            key={`user-purge-${currentRow.id}`}
            open={open === 'purge'}
            onOpenChange={() => {
              setOpen('purge')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
