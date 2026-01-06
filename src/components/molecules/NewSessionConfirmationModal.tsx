import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/shadui/alert-dialog";

interface NewSessionConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    mode: string;
}

export function NewSessionConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    mode,
}: NewSessionConfirmationModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Start a New Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are switching to <strong>{mode}</strong> mode. To ensure the best results and avoid context mixing, we recommend starting a fresh conversation.
                        <br /><br />
                        Current conversation history will be preserved in your session list.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Stay Here</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Start New Session</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
