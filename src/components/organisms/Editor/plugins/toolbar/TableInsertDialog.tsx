import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadui/dialog";
import { Button } from "@/components/shadui/button";
import { Input } from "@/components/shadui/input";
import { Label } from "@/components/shadui/label";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { useState } from "react";

interface TableInsertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TableInsertDialog({ open, onOpenChange }: TableInsertDialogProps) {
    const [editor] = useLexicalComposerContext();
    const [rows, setRows] = useState("3");
    const [columns, setColumns] = useState("3");

    const handleInsert = () => {
        const numRows = parseInt(rows, 10);
        const numCols = parseInt(columns, 10);

        if (numRows > 0 && numRows <= 20 && numCols > 0 && numCols <= 10) {
            editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                columns: columns,
                rows: rows,
                includeHeaders: { rows: true, columns: false },
            });
            onOpenChange(false);
            // Reset to defaults
            setRows("3");
            setColumns("3");
        }
    };

    // Preview grid
    const previewRows = Math.min(parseInt(rows, 10) || 1, 5);
    const previewCols = Math.min(parseInt(columns, 10) || 1, 5);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Insert Table</DialogTitle>
                    <DialogDescription>
                        Configure the number of rows and columns for your table.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rows">Rows</Label>
                            <Input
                                id="rows"
                                type="number"
                                min="1"
                                max="20"
                                value={rows}
                                onChange={(e) => setRows(e.target.value)}
                                placeholder="1-20"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="columns">Columns</Label>
                            <Input
                                id="columns"
                                type="number"
                                min="1"
                                max="10"
                                value={columns}
                                onChange={(e) => setColumns(e.target.value)}
                                placeholder="1-10"
                            />
                        </div>
                    </div>

                    {/* Preview Grid */}
                    <div className="mt-2">
                        <Label className="text-xs text-gray-500">Preview (max 5x5)</Label>
                        <div className="mt-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                            <div
                                className="grid gap-0.5"
                                style={{
                                    gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
                                }}
                            >
                                {Array.from({ length: previewRows * previewCols }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-6 bg-white border border-gray-300 rounded-sm"
                                    />
                                ))}
                            </div>
                            {(parseInt(rows, 10) > 5 || parseInt(columns, 10) > 5) && (
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Showing {previewRows}×{previewCols} preview of {rows}×{columns} table
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleInsert}
                        disabled={
                            parseInt(rows, 10) < 1 ||
                            parseInt(rows, 10) > 20 ||
                            parseInt(columns, 10) < 1 ||
                            parseInt(columns, 10) > 10
                        }
                    >
                        Insert Table
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
