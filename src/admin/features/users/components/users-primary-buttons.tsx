import { IconPlus } from '@tabler/icons-react'
import { Button } from '@admin/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <Button className='gap-2' onClick={() => setOpen('create-user')}>
      <IconPlus size={18} />
      Create User
    </Button>
  )
}
