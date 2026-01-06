import { getRouteApi } from '@tanstack/react-router'
import { useUser } from './hooks/use-users'
import { Card, CardContent, CardHeader, CardTitle } from '@admin/components/ui/card'
import { Badge } from '@admin/components/ui/badge'
import { Skeleton } from '@admin/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@admin/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@admin/components/ui/tabs'
import { AlertCircle, User, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { UserBillingTab } from './components/user-billing-tab'

const route = getRouteApi('/admin/_authenticated/users/$userId')

export function UserDetail() {
    const { userId } = route.useParams()
    const { data: user, isLoading, error } = useUser(userId)

    if (isLoading) {
        return (
            <div className='space-y-6'>
                <Card>
                    <CardHeader>
                        <Skeleton className='h-8 w-1/3' />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-2/3' />
                        <Skeleton className='h-4 w-1/2' />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load user details: {error.message}
                </AlertDescription>
            </Alert>
        )
    }

    if (!user) {
        return (
            <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>
                    User not found.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-3xl font-bold tracking-tight'>{user.full_name}</h2>
                <p className='text-muted-foreground'>
                    Manage user details, billing, and profile information.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Billing
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <h4 className='font-semibold text-sm text-muted-foreground'>Email</h4>
                                    <p>{user.email}</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-sm text-muted-foreground'>User ID</h4>
                                    <p className='font-mono text-sm'>{user.id}</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-sm text-muted-foreground'>Role</h4>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-sm text-muted-foreground'>Status</h4>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <Badge variant={
                                            user.status === 'active' ? 'default' :
                                                user.status === 'pending' ? 'secondary' : 'destructive'
                                        }>
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-sm text-muted-foreground'>Joined Date</h4>
                                    <p>{user.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <UserBillingTab userId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

