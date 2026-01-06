import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/app/refunds/$refundId')({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: '/app/subscription/refunds/$refundId',
            params: { refundId: params.refundId },
        });
    },
});
