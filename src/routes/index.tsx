import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  // Redirect to landing page by default
  return <Navigate to="/landing" replace />
}
