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
import { Input } from "@admin/components/ui/input";
import { Badge } from "@admin/components/ui/badge";
import { adminAiConfigApi } from "@admin/lib/api/admin-api";
import type { AiConfiguration } from "@admin/lib/types/admin-api";
import { toaster } from '@admin/hooks/useToaster';
import { Edit2, Save, X } from "lucide-react";

export function AiConfigTable() {
    const [configs, setConfigs] = useState<AiConfiguration[]>([]);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const fetchConfigs = async () => {
        try {
            const data = await adminAiConfigApi.getConfigs();
            setConfigs(data || []);
        } catch (error) {
            console.error("Failed to fetch AI configs", error);
            toaster.error("Error", {
                description: "Failed to load configurations",
            });
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleEdit = (config: AiConfiguration) => {
        setEditingKey(config.key);
        setEditValue(config.value);
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue("");
    };

    const handleSave = async (key: string) => {
        try {
            await adminAiConfigApi.updateConfig(key, { value: editValue });
            toaster.success("Success", {
                description: "Configuration updated",
            });
            setEditingKey(null);
            fetchConfigs();
        } catch (error) {
            console.error("Failed to update config", error);
            toaster.error("Error", {
                description: "Failed to update configuration",
            });
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {configs.map((config) => (
                        <TableRow key={config.key}>
                            <TableCell className="font-medium">{config.key}</TableCell>
                            <TableCell>
                                {editingKey === config.key ? (
                                    <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8 w-full"
                                    />
                                ) : (
                                    <span className="truncate block max-w-[200px]">{config.value}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{config.value_type}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{config.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {config.description}
                            </TableCell>
                            <TableCell>
                                {editingKey === config.key ? (
                                    <div className="flex space-x-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleSave(config.key)}>
                                            <Save className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={handleCancel}>
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(config)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
