import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toaster } from '@admin/hooks/useToaster'
import { Plus, Trash2, Edit2, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@admin/components/ui/card'
import { Button } from '@admin/components/ui/button'
import { Badge } from '@admin/components/ui/badge'
import { Skeleton } from '@admin/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@admin/components/ui/alert-dialog'
import { Input } from '@admin/components/ui/input'
import { Label } from '@admin/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@admin/components/ui/form'
import { useUserBilling, useCreateBilling, useUpdateBilling, useDeleteBilling } from '../hooks/use-user-billing'
import { createBillingRequestSchema, type AdminBilling, type CreateBillingRequest } from '@admin/lib/types/admin-api'

interface UserBillingTabProps {
    userId: string
}

export function UserBillingTab({ userId }: UserBillingTabProps) {
    const { data: billingAddresses = [], isLoading } = useUserBilling(userId)
    const createMutation = useCreateBilling(userId)
    const updateMutation = useUpdateBilling()
    const deleteMutation = useDeleteBilling()

    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingBilling, setEditingBilling] = useState<AdminBilling | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const form = useForm<CreateBillingRequest>({
        resolver: zodResolver(createBillingRequestSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            is_default: false,
        },
    })

    const handleOpenCreate = () => {
        form.reset()
        setEditingBilling(null)
        setFormDialogOpen(true)
    }

    const handleOpenEdit = (billing: AdminBilling) => {
        form.reset({
            first_name: billing.first_name,
            last_name: billing.last_name,
            email: billing.email,
            phone: billing.phone || '',
            address_line1: billing.address_line1,
            address_line2: billing.address_line2 || '',
            city: billing.city,
            state: billing.state,
            postal_code: billing.postal_code,
            country: billing.country,
            is_default: billing.is_default,
        })
        setEditingBilling(billing)
        setFormDialogOpen(true)
    }

    const handleSubmit = async (data: CreateBillingRequest) => {
        try {
            if (editingBilling) {
                await updateMutation.mutateAsync({ id: editingBilling.id, data })
                toaster.success('Billing address updated')
            } else {
                await createMutation.mutateAsync(data)
                toaster.success('Billing address created')
            }
            setFormDialogOpen(false)
            form.reset()
        } catch (error) {
            toaster.error('Failed to save billing address')
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await deleteMutation.mutateAsync(deletingId)
            toaster.success('Billing address deleted')
            setDeleteDialogOpen(false)
            setDeletingId(null)
        } catch (error) {
            toaster.error('Failed to delete billing address')
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Billing Addresses</h3>
                    <p className="text-sm text-muted-foreground">Manage billing addresses for this user</p>
                </div>
                <Button onClick={handleOpenCreate} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </Button>
            </div>

            {billingAddresses.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No billing addresses found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {billingAddresses.map((billing) => (
                        <Card key={billing.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">
                                            {billing.first_name} {billing.last_name}
                                        </CardTitle>
                                        {billing.is_default && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Star className="h-3 w-3" /> Default
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(billing)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => {
                                                setDeletingId(billing.id)
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>{billing.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p>{billing.address_line1}</p>
                                {billing.address_line2 && <p>{billing.address_line2}</p>}
                                <p>
                                    {billing.city}, {billing.state} {billing.postal_code}
                                </p>
                                <p>{billing.country}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingBilling ? 'Edit' : 'Add'} Billing Address</DialogTitle>
                        <DialogDescription>
                            Enter the billing address details below.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address_line1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingBilling ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Billing Address?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The billing address will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
