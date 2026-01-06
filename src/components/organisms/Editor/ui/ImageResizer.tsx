import type { LexicalEditor } from 'lexical';
import { calculateZoomLevel } from '@lexical/utils';
import * as React from 'react';
import { useRef } from 'react';

const Direction = {
    east: 1 << 0,
    north: 1 << 3,
    south: 1 << 1,
    west: 1 << 2,
};

export default function ImageResizer({
    onResizeStart,
    onResizeEnd,
    imageRef,
    maxWidth,
    editor,
    setShowCaption,
}: {
    editor: LexicalEditor;
    buttonRef: { current: null | HTMLButtonElement };
    imageRef: { current: null | HTMLElement };
    maxWidth?: number;
    onResizeEnd: (width: 'inherit' | number, height: 'inherit' | number) => void;
    onResizeStart: () => void;
    setShowCaption: (show: boolean) => void;
    showCaption: boolean;
    captionsEnabled: boolean;
}): React.JSX.Element {
    const controlWrapperRef = useRef<HTMLDivElement>(null);
    const userSelect = useRef({
        priority: '',
        value: 'default',
    });
    const positioningRef = useRef<{
        currentHeight: 'inherit' | number;
        currentWidth: 'inherit' | number;
        direction: number;
        isResizing: boolean;
        ratio: number;
        startHeight: number;
        startWidth: number;
        startX: number;
        startY: number;
    }>({
        currentHeight: 0,
        currentWidth: 0,
        direction: 0,
        isResizing: false,
        ratio: 0,
        startHeight: 0,
        startWidth: 0,
        startX: 0,
        startY: 0,
    });
    const editorRootElement = editor.getRootElement();
    // Find max width, accounting for editor padding.
    const containerMaxWidth = maxWidth
        ? maxWidth
        : editorRootElement !== null
            ? editorRootElement.getBoundingClientRect().width - 20
            : 100;

    const handlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        direction: number,
    ) => {
        if (!editor.isEditable()) {
            return;
        }

        const image = imageRef.current;
        const controlWrapper = controlWrapperRef.current;

        if (image !== null && controlWrapper !== null) {
            event.preventDefault();
            const { width, height } = image.getBoundingClientRect();
            const zoom = calculateZoomLevel(image);
            const positioning = positioningRef.current;
            positioning.startWidth = width;
            positioning.startHeight = height;
            positioning.ratio = width / height;
            positioning.currentWidth = width;
            positioning.currentHeight = height;
            positioning.startX = event.clientX / zoom;
            positioning.startY = event.clientY / zoom;
            positioning.isResizing = true;
            positioning.direction = direction;

            userSelect.current = {
                priority: controlWrapper.style.getPropertyPriority('user-select'),
                value: controlWrapper.style.getPropertyValue('user-select'),
            };
            controlWrapper.style.setProperty('user-select', 'none', 'important');

            onResizeStart();

            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
        }
    };

    const handlePointerMove = (event: PointerEvent) => {
        const image = imageRef.current;
        const positioning = positioningRef.current;

        if (positioning.isResizing && image !== null) {
            const zoom = calculateZoomLevel(image);
            // Diff in pixels
            let diff = Math.floor(positioning.startX - event.clientX / zoom);
            const direction = positioning.direction;

            // Handle East/West (Width)
            if (direction & Direction.east) {
                diff = -diff;
            } else if (direction & Direction.west) {
                // diff is positive if moving left (increasing width for west handle?)
                // Actually standard diff: start - current
                // If dragging West (left): current < start, diff > 0. Width should increase.
            }

            // Simplification: Standardize diff logic
            const currentX = event.clientX / zoom;
            const currentY = event.clientY / zoom;

            let width = positioning.startWidth;
            let height = positioning.startHeight;

            if (direction & Direction.east) {
                width = positioning.startWidth + (currentX - positioning.startX);
            } else if (direction & Direction.west) {
                width = positioning.startWidth - (currentX - positioning.startX);
            }

            if (direction & Direction.south) {
                height = positioning.startHeight + (currentY - positioning.startY);
            } else if (direction & Direction.north) {
                height = positioning.startHeight - (currentY - positioning.startY);
            }

            // Lock Aspect Ratio if corner
            if ((direction & Direction.east || direction & Direction.west) &&
                (direction & Direction.south || direction & Direction.north)) {
                // It's a corner
                width = Math.max(width, 100); // Min width
                height = width / positioning.ratio;
            } else {
                // Just side
                // If height only? (North/South) - maintain ratio usually?
                // Or allow stretch? Default ImageNode usually locks ratio.
                // Let's lock ratio for simplicity unless typical behavior differs.
                if (direction & Direction.west || direction & Direction.east) {
                    height = width / positioning.ratio;
                } else {
                    width = height * positioning.ratio;
                }
            }

            // Checks
            width = Math.max(100, width);
            height = Math.max(100, height);

            if (width > containerMaxWidth) {
                width = containerMaxWidth;
                height = width / positioning.ratio;
            }

            positioning.currentWidth = width;
            positioning.currentHeight = height;

            image.style.width = `${width}px`;
            image.style.height = `${height}px`;
        }
    };

    const handlePointerUp = () => {
        const image = imageRef.current;
        const positioning = positioningRef.current;
        const controlWrapper = controlWrapperRef.current;

        if (positioning.isResizing && image !== null && controlWrapper !== null) {
            positioning.isResizing = false;
            controlWrapper.style.setProperty(
                'user-select',
                userSelect.current.value,
                userSelect.current.priority,
            );

            onResizeEnd(positioning.currentWidth, positioning.currentHeight);

            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        }
    };

    return (
        <div ref={controlWrapperRef}>
            <div
                className="absolute top-0 bottom-0 left-0 right-0 border border-blue-500 pointer-events-none"
                style={{
                    display: 'block', // Always show if this component is rendered (it should only be rendered when selected)
                }}
            />
            {/* Corners */}
            <div
                className="absolute w-3 h-3 bg-blue-500 border border-white -top-1.5 -left-1.5 cursor-nw-resize pointer-events-auto"
                onPointerDown={(event) => {
                    handlePointerDown(event, Direction.north | Direction.west);
                }}
            />
            <div
                className="absolute w-3 h-3 bg-blue-500 border border-white -top-1.5 -right-1.5 cursor-ne-resize pointer-events-auto"
                onPointerDown={(event) => {
                    handlePointerDown(event, Direction.north | Direction.east);
                }}
            />
            <div
                className="absolute w-3 h-3 bg-blue-500 border border-white -bottom-1.5 -left-1.5 cursor-sw-resize pointer-events-auto"
                onPointerDown={(event) => {
                    handlePointerDown(event, Direction.south | Direction.west);
                }}
            />
            <div
                className="absolute w-3 h-3 bg-blue-500 border border-white -bottom-1.5 -right-1.5 cursor-se-resize pointer-events-auto"
                onPointerDown={(event) => {
                    handlePointerDown(event, Direction.south | Direction.east);
                }}
            />
        </div>
    );
}
