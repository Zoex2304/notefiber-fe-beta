import { createFileRoute } from '@tanstack/react-router';
import { TokenUsage } from '@admin/features/token-usage';

export const Route = createFileRoute('/_authenticated/token-usage')({
    component: TokenUsage,
});
