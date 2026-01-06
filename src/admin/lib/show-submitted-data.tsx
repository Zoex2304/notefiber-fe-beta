import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Form Submitted:', data)
    toast.message(title, {
      description: (
        <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }
}
