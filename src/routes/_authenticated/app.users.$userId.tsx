import { createFileRoute } from '@tanstack/react-router';
import { UserLimitDetail } from '@/pages/users/UserLimitDetail';

export const Route = createFileRoute('/_authenticated/app/users/$userId')({
    component: UserLimitDetail,
});
