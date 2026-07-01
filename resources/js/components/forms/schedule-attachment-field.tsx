import { Camera, FileUp, Trash2 } from 'lucide-react';
import React from 'react';
import { FormField } from '@/components/forms/form-page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ExistingScheduleAttachment = {
    url: string;
    name: string;
    mime: string;
};

type ScheduleAttachmentFieldProps = {
    attachment: File | null;
    removeAttachment: boolean;
    existingAttachment?: ExistingScheduleAttachment | null;
    error?: string;
    onAttachmentChange: (file: File | null) => void;
    onRemoveAttachmentChange: (remove: boolean) => void;
};

function isImageMime(mime: string): boolean {
    return mime.startsWith('image/');
}

export function ScheduleAttachmentField({
    attachment,
    removeAttachment,
    existingAttachment = null,
    error,
    onAttachmentChange,
    onRemoveAttachmentChange,
}: ScheduleAttachmentFieldProps) {
    const cameraInputRef = React.useRef<HTMLInputElement>(null);
    const uploadInputRef = React.useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!attachment) {
            setPreviewUrl(null);

            return;
        }

        if (!attachment.type.startsWith('image/')) {
            setPreviewUrl(null);

            return;
        }

        const objectUrl = URL.createObjectURL(attachment);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [attachment]);

    const showExisting =
        existingAttachment !== null &&
        existingAttachment !== undefined &&
        !removeAttachment &&
        attachment === null;

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        onAttachmentChange(file);
        onRemoveAttachmentChange(false);
        event.target.value = '';
    };

    const handleClearSelection = () => {
        onAttachmentChange(null);

        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }

        if (uploadInputRef.current) {
            uploadInputRef.current.value = '';
        }
    };

    const handleRemoveExisting = () => {
        onRemoveAttachmentChange(true);
        onAttachmentChange(null);
    };

    const handleUndoRemoveExisting = () => {
        onRemoveAttachmentChange(false);
    };

    return (
        <FormField
            id="attachment"
            label="Attachment"
            hint="Optional photo or PDF. On mobile you can take a picture or upload a file."
            error={error}
        >
            <div className="space-y-4">
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-xl"
                        onClick={() => cameraInputRef.current?.click()}
                    >
                        <Camera className="size-4" />
                        Take photo
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-xl"
                        onClick={() => uploadInputRef.current?.click()}
                    >
                        <FileUp className="size-4" />
                        Upload file
                    </Button>
                </div>

                {attachment && (
                    <div
                        className={cn(
                            'flex items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-4',
                        )}
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Selected attachment preview"
                                className="size-20 rounded-lg object-cover ring-1 ring-border"
                            />
                        ) : (
                            <div className="flex size-20 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground ring-1 ring-border">
                                PDF
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {attachment.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Ready to upload
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={handleClearSelection}
                            aria-label="Remove selected file"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}

                {showExisting && (
                    <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                        {isImageMime(existingAttachment.mime) ? (
                            <img
                                src={existingAttachment.url}
                                alt={existingAttachment.name}
                                className="size-20 rounded-lg object-cover ring-1 ring-border"
                            />
                        ) : (
                            <div className="flex size-20 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground ring-1 ring-border">
                                PDF
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {existingAttachment.name}
                            </p>
                            <a
                                href={existingAttachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                            >
                                View current file
                            </a>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={handleRemoveExisting}
                            aria-label="Remove existing attachment"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}

                {removeAttachment && existingAttachment && !attachment && (
                    <div className="flex items-center justify-between rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">
                            Current attachment will be removed on save.
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleUndoRemoveExisting}
                        >
                            Undo
                        </Button>
                    </div>
                )}
            </div>
        </FormField>
    );
}
