import { createFileRoute } from '@tanstack/react-router'
import NotePage from '@/pages/NotePage'

export const Route = createFileRoute('/_authenticated/app/note/$noteId')({
    component: NotePage,
})
