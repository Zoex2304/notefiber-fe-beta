import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@admin/components/ui/table";
import { Button } from "@admin/components/ui/button";
import { Badge } from "@admin/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu";
import { adminAiNuanceApi } from "@admin/lib/api/admin-api";
import type { AiNuance } from "@admin/lib/types/admin-api";
import { toaster } from '@admin/hooks/useToaster';
import { MoreHorizontal, Plus } from "lucide-react";
import { NuanceForm } from "./NuanceForm";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@admin/components/ui/sheet";

export function AiNuanceList() {
    const [nuances, setNuances] = useState<AiNuance[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingNuance, setEditingNuance] = useState<AiNuance | undefined>(undefined);

    const fetchNuances = async () => {
        try {
            const data = await adminAiNuanceApi.getNuances();
            setNuances(data || []);
        } catch (error) {
            console.error("Failed to fetch nuances", error);
            toaster.error("Error", {
                description: "Failed to load nuances",
            });
        }
    };

    useEffect(() => {
        fetchNuances();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this nuance?")) return;
        try {
            await adminAiNuanceApi.deleteNuance(id);
            toaster.success("Nuance deleted");
            fetchNuances();
        } catch (error) {
            console.error("Failed to delete nuance", error);
            toaster.error("Error", {
                description: "Failed to delete nuance",
            });
        }
    };

    const handleEdit = (nuance: AiNuance) => {
        setEditingNuance(nuance);
        setIsSheetOpen(true);
    };

    const handleCreate = () => {
        setEditingNuance(undefined);
        setIsSheetOpen(true);
    };

    const onSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) setEditingNuance(undefined);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">AI Nuances</h2>
                <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> New Nuance
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingNuance ? "Edit Nuance" : "Create Nuance"}</SheetTitle>
                            <SheetDescription>
                                Configure the behavior and model for this nuance.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 px-6">
                            <NuanceForm
                                nuance={editingNuance}
                                onSuccess={() => {
                                    setIsSheetOpen(false);
                                    fetchNuances();
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Model Override</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nuances.map((nuance) => (
                            <TableRow key={nuance.id}>
                                <TableCell className="font-mono text-sm">{nuance.key}</TableCell>
                                <TableCell>{nuance.name}</TableCell>
                                <TableCell>
                                    {nuance.model_override ? (
                                        <Badge variant="outline">{nuance.model_override}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Default</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={nuance.is_active ? "default" : "secondary"}>
                                        {nuance.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(nuance)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDelete(nuance.id)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
