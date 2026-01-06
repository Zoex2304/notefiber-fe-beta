import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toaster } from '@/hooks/useToaster';
import { CreditCard, Edit2, MapPin, Loader2, User, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Skeleton } from '@/components/shadui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadui/dialog';
import { Input } from '@/components/shadui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/shadui/form';
import { useBillingInfo, useUpdateBilling } from '@/hooks/user/useBilling';
import { userBillingUpdateRequestSchema } from '@/api/services/billing/billing.schemas';
import type { UserBillingUpdateRequest } from '@/api/services/billing/billing.types';
import { LocationFields } from '@/components/billing/LocationFields';

export function BillingInfoCard() {
    const { data: billing, isLoading } = useBillingInfo();
    const updateMutation = useUpdateBilling();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const form = useForm<UserBillingUpdateRequest>({
        resolver: zodResolver(userBillingUpdateRequestSchema),
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
            country: 'ID',
        },
    });

    // Pre-fill form when billing data loads
    useEffect(() => {
        if (billing && editDialogOpen) {
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
                country: billing.country || 'ID',
            });
        }
    }, [billing, editDialogOpen, form]);

    const handleEdit = () => {
        setEditDialogOpen(true);
    };

    const handleSubmit = async (data: UserBillingUpdateRequest) => {
        try {
            await updateMutation.mutateAsync(data);
            toaster.success('Billing information updated');
            setEditDialogOpen(false);
        } catch {
            toaster.error('Failed to update billing information');
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-sm border-border">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        );
    }

    const hasBilling = billing && billing.address_line1;

    return (
        <>
            <Card className="shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Billing Information
                        </CardTitle>
                        <CardDescription>
                            Your saved billing address for payments
                        </CardDescription>
                    </div>
                    {hasBilling && (
                        <Button variant="ghost" size="sm" onClick={handleEdit}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {hasBilling ? (
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">
                                {billing.first_name} {billing.last_name}
                            </p>
                            <p className="text-muted-foreground">{billing.email}</p>
                            <div className="pt-2">
                                <p>{billing.address_line1}</p>
                                {billing.address_line2 && <p>{billing.address_line2}</p>}
                                <p>
                                    {billing.city}, {billing.state} {billing.postal_code}
                                </p>
                                <p>{billing.country}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-muted-foreground">
                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No billing information saved</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={handleEdit}>
                                Add Billing Address
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {hasBilling ? 'Edit' : 'Add'} Billing Information
                        </DialogTitle>
                        <DialogDescription>
                            This information will be used for your subscription payments.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="John" {...field} className="pl-9" />
                                                </div>
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
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="Doe" {...field} className="pl-9" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Contact Fields */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="email" placeholder="john@example.com" {...field} className="pl-9" />
                                            </div>
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
                                        <FormLabel>Phone (optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="08123456789" {...field} className="pl-9" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Address Fields */}
                            <FormField
                                control={form.control}
                                name="address_line1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="123 Main St" {...field} className="pl-9" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Location Fields (Cascading API) */}
                            <LocationFields form={form} defaultCountry={billing?.country || 'ID'} />

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
