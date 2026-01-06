import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@admin/features/chats'

export const Route = createFileRoute('/_authenticated/chats/')({
  component: Chats,
})
