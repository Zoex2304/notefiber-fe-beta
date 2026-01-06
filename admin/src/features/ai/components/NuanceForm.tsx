import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@admin/components/ui/form";
import { Input } from "@admin/components/ui/input";
import { Textarea } from "@admin/components/ui/textarea";
import { Switch } from "@admin/components/ui/switch";
import { Button } from "@admin/components/ui/button";
import { adminAiNuanceApi } from "@admin/lib/api/admin-api";
import type { AiNuance } from "@admin/lib/types/admin-api";
import { toaster } from '@admin/hooks/useToaster';

const formSchema = z.object({
    key: z.string().min(2, "Key must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    system_prompt: z.string().min(10, "System prompt must be descriptive"),
    model_override: z.string().optional(),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().default(0),
});

interface NuanceFormProps {
    nuance?: AiNuance;
    onSuccess: () => void;
}

export function NuanceForm({ nuance, onSuccess }: NuanceFormProps) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            key: nuance?.key || "",
            name: nuance?.name || "",
            description: nuance?.description || "",
            system_prompt: nuance?.system_prompt || "",
            model_override: nuance?.model_override || "",
            is_active: nuance?.is_active ?? true,
            sort_order: nuance?.sort_order ?? 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (nuance) {
                await adminAiNuanceApi.updateNuance(nuance.id, {
                    ...values,
                    sort_order: typeof values.sort_order === 'number' ? values.sort_order : 0
                });
                toaster.success("Nuance updated");
            } else {
                await adminAiNuanceApi.createNuance({
                    ...values,
                    sort_order: typeof values.sort_order === 'number' ? values.sort_order : 0
                });
                toaster.success("Nuance created");
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save nuance", error);
            toaster.error("Error", {
                description: "Failed to save nuance",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. engineering" {...field} disabled={!!nuance} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Engineering Mode" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Brief description of what this nuance does..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="model_override"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model Override</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. deepseek-coder" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">Optional specific model</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sort_order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="system_prompt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>System Prompt</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="You are a senior engineer..."
                                    className="min-h-[150px] font-mono text-sm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                    Available for users to select
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <Button type="submit" className="w-full" size="lg">
                        {nuance ? "Update Nuance" : "Create Nuance"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
