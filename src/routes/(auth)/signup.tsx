import { createFileRoute, redirect } from '@tanstack/react-router'
import SignUp from '@/pages/auth/SignUp'

export const Route = createFileRoute('/(auth)/signup')({
    component: SignUp,
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
