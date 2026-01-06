import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@admin/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from '@admin/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@admin/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@admin/components/ui/tabs'
import { useAdminUserCreate } from '../hooks/use-admin-user-create'
import { UploadCloud, FileJson } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@admin/components/ui/alert'

const formSchema = z.object({
    full_name: z.string().min(1, 'Full Name is required.'),
    email: z.email('Invalid email address.'),
    role: z.enum(['user', 'admin']),
})

type UserForm = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const { createSingle, createBulk } = useAdminUserCreate()

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: '',
            email: '',
            role: 'user',
        },
    })

    const onSubmitSingle = (values: UserForm) => {
        createSingle.mutate(values, {
            onSuccess: () => {
                form.reset()
                onOpenChange(false)
            }
        })
    }

    const onSubmitBulk = () => {
        if (!file) return
        createBulk.mutate(file, {
            onSuccess: () => {
                setFile(null)
                onOpenChange(false)
            }
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected && selected.type === 'application/json') {
            setFile(selected)
        } else {
            // Optionally handle invalid file type error
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user locally or upload a JSON file for bulk creation.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="single" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Single User</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-4 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitSingle)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Alice Johnson" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="alice@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={createSingle.isPending}>
                                        {createSingle.isPending ? 'Creating...' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="bulk" className="space-y-4 py-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors relative">
                            <input
                                type="file"
                                accept=".json"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                {file ? file.name : "Click to upload JSON"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {file ? `${(file.size / 1024).toFixed(2)} KB` : "Supports .json file with users array"}
                            </p>
                        </div>


                        {file && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <FileJson className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Ready to upload</AlertTitle>
                                <AlertDescription className="text-blue-600 text-xs">
                                    This file will be processed for bulk user creation.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={onSubmitBulk}
                                disabled={!file || createBulk.isPending}
                            >
                                {createBulk.isPending ? 'Uploading...' : 'Import Users'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    )
}
