export { };

interface MidtransSnapResult {
    order_id?: string;
    status_code?: string;
    transaction_status?: string;
    [key: string]: unknown;
}

declare global {
    interface Window {
        snap: {
            pay: (token: string, callbacks?: {
                onSuccess?: (result: MidtransSnapResult) => void;
                onPending?: (result: MidtransSnapResult) => void;
                onError?: (result: MidtransSnapResult) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}
