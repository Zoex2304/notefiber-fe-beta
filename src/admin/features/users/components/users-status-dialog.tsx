'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@admin/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@admin/components/ui/form'
import { Textarea } from '@admin/components/ui/textarea'
import { SelectDropdown } from '@admin/components/select-dropdown'
import { type User } from '@admin/lib/types/admin-api'
import { useUpdateUserStatus } from '../hooks/use-users'

const formSchema = z.object({
    status: z.enum(['active', 'pending', 'banned']),
    reason: z.string().optional(),
})

type UserStatusForm = z.infer<typeof formSchema>

type UsersStatusDialogProps = {
    currentRow?: User
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UsersStatusDialog({
    currentRow,
    open,
    onOpenChange,
}: UsersStatusDialogProps) {
    const { mutate: updateStatus, isPending } = useUpdateUserStatus()

    const form = useForm<UserStatusForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: currentRow?.status || 'active',
            reason: '',
        },
    })

    const onSubmit = (values: UserStatusForm) => {
        if (!currentRow) return

        updateStatus(
            { id: currentRow.id, status: values.status, reason: values.reason },
            {
                onSuccess: () => {
                    form.reset()
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-md'>
                <DialogHeader className='text-start'>
                    <DialogTitle>Update User Status</DialogTitle>
                    <DialogDescription>
                        Change the status of <span className='font-bold'>{currentRow?.full_name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='user-status-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='status'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <SelectDropdown
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select a status'
                                        items={[
                                            { label: 'Active', value: 'active' },
                                            { label: 'Pending', value: 'pending' },
                                            { label: 'Banned', value: 'banned' },
                                        ]}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='reason'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className='resize-none'
                                            placeholder='Reason for status change...'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type='submit' form='user-status-form' disabled={isPending}>
                        Update Status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
