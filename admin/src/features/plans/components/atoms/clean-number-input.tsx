import * as React from "react"
import { Input } from "@admin/components/ui/input"
import { cn } from "@admin/lib/utils"

interface CleanNumberInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
    value: number
    onChange: (value: number) => void
    allowNegative?: boolean
}

export const CleanNumberInput = React.forwardRef<HTMLInputElement, CleanNumberInputProps>(
    ({ className, value, onChange, allowNegative = false, min, ...props }, ref) => {
        // Local string state to handle typing "0", "-", etc.
        const [inputValue, setInputValue] = React.useState(value.toString())

        // Sync local state with prop value when it changes externally
        React.useEffect(() => {
            setInputValue(value.toString())
        }, [value])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value
            setInputValue(newValue) // Always update display immediately

            // Empty string -> 0 (or could be undefined if we supported it)
            if (newValue === '') {
                onChange(0)
                return
            }

            // Handle parsing
            const parsed = parseInt(newValue)

            if (!isNaN(parsed)) {
                // If we don't allow negatives and it's negative
                if (!allowNegative && parsed < 0) {
                    onChange(0)
                    return
                }
                onChange(parsed)
            }
        }

        const handleBlur = () => {
            // On blur, force the display to match the numeric value (removes leading zeros, etc)
            setInputValue(value.toString())
        }

        return (
            <Input
                type="number"
                className={cn(
                    // Remove spinner buttons
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    className
                )}
                ref={ref}
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                min={allowNegative ? undefined : (min || 0)}
                {...props}
            />
        )
    }
)
CleanNumberInput.displayName = "CleanNumberInput"
