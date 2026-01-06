"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/shadui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/shadui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/shadui/popover"

export interface Option {
    value: string
    label: string
    key?: string
}

interface ComboboxProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    disabled?: boolean
    // Optional props for async search support, keeping them optional to not break call sites
    searchValue?: string
    onSearchChange?: (value: string) => void
    icon?: React.ElementType
    modal?: boolean
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    className,
    disabled,
    searchValue,
    onSearchChange,
    modal = false,
    icon: Icon
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between relative pl-9", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {Icon && (
                        <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">
                        {value
                            ? options.find((option) => option.value === value)?.label || value
                            : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-[200]" align="start">
                <Command shouldFilter={!onSearchChange}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        // Only control value if onSearchChange is present (async mode)
                        value={onSearchChange ? searchValue : undefined}
                        onValueChange={onSearchChange}
                        className="border-none focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.key || option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        // Shadcn/cmdk might alter the value (lowercase etc), but we want the Option value
                                        // We map back by finding the option that matches the label (currentValue) OR just use the closure's option.value
                                        // Using closure option.value is safer for ID-based selects with same labels, 
                                        // but CommandItem 'value' prop dictates search.
                                        onChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
