import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@admin/lib/utils'
import { Button } from '@admin/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
  error,
}: GeneralErrorProps & { error?: Error }) {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>500</h1>
        )}
        <span className='font-medium'>Oops! Something went wrong {`:')`}</span>
        <p className='text-muted-foreground text-center'>
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {error && (
          <div className="mt-4 max-w-lg overflow-auto rounded bg-red-100 p-4 text-left text-sm text-red-900 border border-red-200">
            <p className="font-bold">Error Details:</p>
            <p>{error.message}</p>
            {/* Stack trace commented out to avoid clutter, uncomment if needed */}
            {/* <pre className="mt-2 text-xs">{error.stack}</pre> */}
          </div>
        )}
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  )
}
