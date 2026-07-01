import { ArrowLeft, Copy, Mail, MessageCircle } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatScheduleDate } from '@/pages/admin/schedules/schedule-format';
import {
    copySchedulesShareMessage,
    formatSchedulesShareMessage,
    openSchedulesEmailShare,
    openSchedulesWhatsAppShare
    
} from '@/pages/admin/schedules/schedule-share';
import type {ScheduleShareData} from '@/pages/admin/schedules/schedule-share';

type ScheduleShareModalProps = {
    schedules: ScheduleShareData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function shareDescription(schedules: ScheduleShareData[]): string {
    if (schedules.length === 0) {
        return 'Choose how you want to share this schedule.';
    }

    if (schedules.length === 1) {
        return `${schedules[0].crew_name} · ${formatScheduleDate(schedules[0].scheduled_date)}`;
    }

    const dates = schedules.map((schedule) => schedule.scheduled_date).sort();
    const firstDate = formatScheduleDate(dates[0]);
    const lastDate = formatScheduleDate(dates[dates.length - 1]);
    const dateSpan = firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;

    return `${schedules.length} schedules · ${dateSpan}`;
}

export function ScheduleShareModal({ schedules, open, onOpenChange }: ScheduleShareModalProps) {
    const [emailStep, setEmailStep] = React.useState(false);
    const [recipient, setRecipient] = React.useState('');
    const preview = schedules.length > 0 ? formatSchedulesShareMessage(schedules) : '';
    const isMultiple = schedules.length > 1;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setEmailStep(false);
            setRecipient('');
        }

        onOpenChange(nextOpen);
    };

    const handleCopy = async () => {
        if (schedules.length === 0) {
            return;
        }

        try {
            await copySchedulesShareMessage(schedules);
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Unable to copy to clipboard');
        }
    };

    const handleWhatsApp = () => {
        if (schedules.length === 0) {
            return;
        }

        const opened = openSchedulesWhatsAppShare(schedules);

        if (!opened) {
            toast.error('Message is too long for WhatsApp. Try sharing fewer schedules or use Copy instead.');

            return;
        }

        handleOpenChange(false);
    };

    const handleSendEmail = () => {
        if (schedules.length === 0) {
            return;
        }

        const trimmed = recipient.trim();

        if (trimmed === '') {
            toast.error('Enter a recipient email address');

            return;
        }

        if (!isValidEmail(trimmed)) {
            toast.error('Enter a valid email address');

            return;
        }

        openSchedulesEmailShare(schedules, trimmed);
        handleOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b border-border/40 px-5 py-4 text-left">
                    <DialogTitle>
                        {emailStep ? 'Send by email' : isMultiple ? `Share ${schedules.length} schedules` : 'Share schedule'}
                    </DialogTitle>
                    <DialogDescription>{shareDescription(schedules)}</DialogDescription>
                </DialogHeader>

                <div className="px-5 py-4">
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Preview
                    </label>
                    <textarea
                        readOnly
                        value={preview}
                        rows={emailStep ? 8 : 12}
                        className="custom-scrollbar w-full resize-none rounded-xl border border-border/40 bg-muted/20 px-3 py-3 font-mono text-[12px] leading-relaxed text-foreground"
                    />
                </div>

                {emailStep ? (
                    <div className="space-y-4 border-t border-border/40 px-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="share-email-recipient" className="text-[12px] font-semibold text-muted-foreground">
                                Send to
                            </Label>
                            <Input
                                id="share-email-recipient"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="name@example.com"
                                value={recipient}
                                onChange={(event) => setRecipient(event.target.value)}
                                className="h-11 rounded-xl border-border/40 bg-background/50"
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleSendEmail();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl sm:flex-1"
                                onClick={() => setEmailStep(false)}
                            >
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                            <Button type="button" className="h-11 rounded-xl sm:flex-1" onClick={handleSendEmail}>
                                <Mail className="size-4" />
                                Open in email app
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 border-t border-border/40 px-5 py-4 sm:grid-cols-3">
                        <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => void handleCopy()}>
                            <Copy className="size-4" />
                            Copy
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-xl border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400"
                            onClick={handleWhatsApp}
                        >
                            <MessageCircle className="size-4" />
                            WhatsApp
                        </Button>
                        <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => setEmailStep(true)}>
                            <Mail className="size-4" />
                            Email
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
