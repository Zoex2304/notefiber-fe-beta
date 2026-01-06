import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/cancellations/$cancellationId')({
    component: () => {
        const { cancellationId } = Route.useParams()
        return <Navigate to="/app/cancellations/$cancellationId" params={{ cancellationId }} replace />
    },
})
