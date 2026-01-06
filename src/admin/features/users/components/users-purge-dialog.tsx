'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@admin/components/ui/alert'
import { Input } from '@admin/components/ui/input'
import { Label } from '@admin/components/ui/label'
import { ConfirmDialog } from '@admin/components/confirm-dialog'
import { type User } from '@admin/lib/types/admin-api'
import { usePurgeUsers } from '../hooks/use-users'

type UsersPurgeDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: User
}

export function UsersPurgeDialog({
    open,
    onOpenChange,
    currentRow,
}: UsersPurgeDialogProps) {
    const [value, setValue] = useState('')
    const { mutate: purgeUsers, isPending } = usePurgeUsers()

    const handlePurge = () => {
        if (value.trim() !== currentRow.email) return

        purgeUsers([currentRow.id], {
            onSuccess: () => {
                onOpenChange(false)
                setValue('')
            }
        })
    }

    const confirmValue = currentRow.email

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handlePurge}
            disabled={value.trim() !== confirmValue || isPending}
            title={
                <span className='text-destructive'>
                    <Trash2
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Deep Purge User
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to <strong>Deep Purge</strong>{' '}
                        <span className='font-bold'>{currentRow.full_name}</span>?
                        <br />
                        This action will <span className='font-bold text-destructive'>permanently wipe</span> all data associated with{' '}
                        <span className='font-bold'>{currentRow.email}</span> (subscriptions, chat history, vectors, etc).
                        <br />
                        This cannot be undone.
                    </p>

                    <Label className='my-2'>
                        Email:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Enter email to confirm purge.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Irreversible Action!</AlertTitle>
                        <AlertDescription>
                            This user and all related data will be erased from the database forever.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Deep Purge'
            destructive
        />
    )
}
