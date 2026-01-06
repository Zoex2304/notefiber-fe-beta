import { Button } from "@/components/shadui/button";
import { Image as ImageIcon } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "../../nodes/ImageNode";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/shadui/dialog";
import { Input } from "@/components/shadui/input";
import { Label } from "@/components/shadui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadui/tabs";
import { useState, useRef } from "react";
import { ToolbarButton } from "./ToolbarButton";

export function ImageControls() {
    const [editor] = useLexicalComposerContext();
    const [open, setOpen] = useState(false);
    const [src, setSrc] = useState("");
    const [altText, setAltText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInsert = () => {
        if (!src) return;
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: altText || "Image",
            src,
        });
        setOpen(false);
        setSrc("");
        setAltText("");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === "string") {
                    setSrc(event.target.result);
                    setAltText(file.name);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <ToolbarButton
                    onClick={() => setOpen(true)}
                    icon={ImageIcon}
                    label="Insert Image"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                        Insert an image from a URL or upload from your computer.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">Link (URL)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="space-y-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Picture</Label>
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                            />
                        </div>
                        {src && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-200">
                                <img
                                    src={src}
                                    alt="Preview"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="url" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Image URL</Label>
                            <Input
                                id="url"
                                placeholder="https://example.com/image.png"
                                value={src}
                                onChange={(e) => setSrc(e.target.value)}
                            />
                        </div>
                        {src && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-200">
                                <img
                                    src={src}
                                    alt="Preview"
                                    className="object-contain w-full h-full"
                                    onError={() => setSrc("")} // Reset on error
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                <div className="grid gap-2">
                    <Label htmlFor="alt">Alt Text (Optional)</Label>
                    <Input
                        id="alt"
                        placeholder="Description of the image"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleInsert} disabled={!src}>
                        Insert Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
