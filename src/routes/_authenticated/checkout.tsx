import { createFileRoute } from '@tanstack/react-router'
import Checkout from '@/pages/checkout/Checkout'

export const Route = createFileRoute('/_authenticated/checkout')({
    component: Checkout,
})
