import { createFileRoute } from '@tanstack/react-router';
import { TokenUsage } from '@admin/features/token-usage';

export const Route = createFileRoute('/admin/_authenticated/token-usage')({
    component: TokenUsage,
});
