import { createFileRoute, redirect } from '@tanstack/react-router'
import ResetPassword from '@/pages/auth/ResetPassword'

export const Route = createFileRoute('/(auth)/reset-password')({
    component: ResetPassword,
    beforeLoad: async () => {
        // Check if user is authenticated by checking localStorage
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')

        if (token && refreshToken) {
            // User is authenticated, redirect to app
            throw redirect({ to: '/app', replace: true })
        }
    },
})
