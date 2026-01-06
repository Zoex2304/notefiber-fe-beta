'use client'

import { useState, useEffect } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@admin/components/ui/alert'
import { Input } from '@admin/components/ui/input'
import { Label } from '@admin/components/ui/label'
import { Badge } from '@admin/components/ui/badge'
import { ConfirmDialog } from '@admin/components/confirm-dialog'
import { usePurgeUsers } from '../hooks/use-users'
import { type User } from '@admin/lib/types/admin-api'

type UsersMultiPurgeDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

const CONFIRM_WORD = 'PURGE'

export function UsersMultiPurgeDialog<TData>({
    open,
    onOpenChange,
    table,
}: UsersMultiPurgeDialogProps<TData>) {
    const [value, setValue] = useState('')
    const { mutate: purgeUsers, isPending } = usePurgeUsers()

    // Get selected rows from table
    const selectedRows = table.getFilteredSelectedRowModel().rows

    // Local state for tracking users to be purged (allows removing from list)
    const [usersToPurge, setUsersToPurge] = useState<User[]>([])

    // Sync with selection when dialog opens
    useEffect(() => {
        if (open) {
            const users = selectedRows.map(row => row.original as User)
            setUsersToPurge(users)
            setValue('')
        }
    }, [open, selectedRows])

    const handlePurge = () => {
        if (value.trim() !== CONFIRM_WORD) return

        const ids = usersToPurge.map(u => u.id)
        purgeUsers(ids, {
            onSuccess: () => {
                onOpenChange(false)
                table.resetRowSelection()
            }
        })
    }

    const removeUser = (id: string) => {
        setUsersToPurge(prev => prev.filter(u => u.id !== id))
        // Also update table selection if possible? 
        // table.setRowSelection(...) is complex with ids. 
        // For now we just remove from the "to be purged" list in this modal context.
    }

    if (usersToPurge.length === 0) {
        // If all removed, maybe close? or show empty state?
        // Better to check inside render logic.
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handlePurge}
            disabled={value.trim() !== CONFIRM_WORD || isPending || usersToPurge.length === 0}
            title={
                <span className='text-destructive'>
                    <Trash2
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Deep Purge {usersToPurge.length} Users
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to <strong>Deep Purge</strong> the following users? <br />
                        This action will <span className='font-bold text-destructive'>permanently wipe</span> all data associated with them.
                    </p>

                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 border rounded-md bg-muted/20">
                        {usersToPurge.map(user => (
                            <Badge key={user.id} variant="secondary" className="pr-1 flex items-center gap-1">
                                {user.full_name || user.email}
                                <button
                                    onClick={() => removeUser(user.id)}
                                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                    type="button"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {usersToPurge.length === 0 && (
                            <span className="text-muted-foreground text-sm">No users selected.</span>
                        )}
                    </div>

                    <Label className='my-4 flex flex-col items-start gap-1.5'>
                        <span className=''>Confirm by typing "{CONFIRM_WORD}":</span>
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Irreversible Action!</AlertTitle>
                        <AlertDescription>
                            Any removed users cannot be recovered.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText='Deep Purge'
            destructive
        />
    )
}
