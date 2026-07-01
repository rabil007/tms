import { Camera, FileText, FileUp, Trash2 } from 'lucide-react';
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

type AttachmentActionTileProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
};

function AttachmentActionTile({
    icon,
    title,
    description,
    onClick,
}: AttachmentActionTileProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center transition-colors',
                'hover:border-primary/40 hover:bg-muted/35 active:scale-[0.98] active:bg-muted/45',
                'sm:min-h-12 sm:flex-row sm:justify-start sm:gap-3 sm:rounded-xl sm:border-solid sm:px-4 sm:py-3 sm:text-left',
            )}
        >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-9 sm:rounded-lg">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {description}
                </p>
            </div>
        </button>
    );
}

function AttachmentPreviewCard({
    previewUrl,
    name,
    subtitle,
    onRemove,
    removeLabel,
    viewHref,
}: {
    previewUrl: string | null;
    name: string;
    subtitle: string;
    onRemove: () => void;
    removeLabel: string;
    viewHref?: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:gap-4 sm:p-4">
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt={name}
                    className="size-24 shrink-0 rounded-xl object-cover ring-1 ring-border sm:size-20 sm:rounded-lg"
                />
            ) : (
                <div className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-muted text-muted-foreground ring-1 ring-border sm:size-20 sm:rounded-lg">
                    <FileText className="size-6" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase">
                        PDF
                    </span>
                </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                {viewHref && (
                    <a
                        href={viewHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-primary hover:underline"
                    >
                        View current file
                    </a>
                )}
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 text-muted-foreground hover:text-destructive sm:size-10"
                onClick={onRemove}
                aria-label={removeLabel}
            >
                <Trash2 className="size-5 sm:size-4" />
            </Button>
        </div>
    );
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
    const previewUrl = React.useMemo(() => {
        if (!attachment || !attachment.type.startsWith('image/')) {
            return null;
        }

        return URL.createObjectURL(attachment);
    }, [attachment]);

    React.useEffect(() => {
        if (!previewUrl) {
            return;
        }

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

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
            hint="Optional photo or PDF. JPG, PNG, WebP, or PDF up to 10 MB."
            error={error}
        >
            <div className="space-y-3 sm:space-y-4">
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

                {!attachment && !showExisting && (
                    <div className="rounded-2xl border border-border/50 bg-muted/10 p-3 sm:bg-transparent sm:p-0">
                        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                            <AttachmentActionTile
                                icon={<Camera className="size-5 sm:size-4" />}
                                title="Take photo"
                                description="Use camera"
                                onClick={() => cameraInputRef.current?.click()}
                            />
                            <AttachmentActionTile
                                icon={<FileUp className="size-5 sm:size-4" />}
                                title="Upload file"
                                description="Gallery or PDF"
                                onClick={() => uploadInputRef.current?.click()}
                            />
                        </div>
                    </div>
                )}

                {attachment && (
                    <AttachmentPreviewCard
                        previewUrl={previewUrl}
                        name={attachment.name}
                        subtitle="Ready to upload"
                        onRemove={handleClearSelection}
                        removeLabel="Remove selected file"
                    />
                )}

                {showExisting && (
                    <AttachmentPreviewCard
                        previewUrl={
                            isImageMime(existingAttachment.mime)
                                ? existingAttachment.url
                                : null
                        }
                        name={existingAttachment.name}
                        subtitle="Current attachment"
                        viewHref={existingAttachment.url}
                        onRemove={handleRemoveExisting}
                        removeLabel="Remove existing attachment"
                    />
                )}

                {removeAttachment && existingAttachment && !attachment && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-destructive">
                            Current attachment will be removed on save.
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-10 w-full sm:w-auto"
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
