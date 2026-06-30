import MailSettingsController from '@/actions/App/Http/Controllers/Settings/MailSettingsController';
import { Form, Head, router, usePage } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import React from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { edit as editSmtp } from '@/routes/smtp';
import type { Auth } from '@/types/auth';

export type MailSettings = {
    mailer: 'smtp' | 'log';
    host: string | null;
    port: number;
    username: string | null;
    has_password: boolean;
    encryption: 'tls' | 'ssl' | 'none';
    from_address: string | null;
    from_name: string | null;
    configured: boolean;
};

type PageProps = {
    auth: Auth;
};

export default function SmtpSettings({
    mailSettings,
    emailNotificationsEnabled,
    mailConfigured,
}: {
    mailSettings: MailSettings | null;
    emailNotificationsEnabled: boolean;
    mailConfigured: boolean;
}) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role?.slug === 'admin';

    const [mailer, setMailer] = React.useState<'smtp' | 'log'>(mailSettings?.mailer ?? 'smtp');
    const [encryption, setEncryption] = React.useState<'tls' | 'ssl' | 'none'>(
        mailSettings?.encryption ?? 'tls',
    );
    const [emailEnabled, setEmailEnabled] = React.useState(emailNotificationsEnabled);
    const [emailProcessing, setEmailProcessing] = React.useState(false);
    const [sendingTest, setSendingTest] = React.useState(false);

    React.useEffect(() => {
        setEmailEnabled(emailNotificationsEnabled);
    }, [emailNotificationsEnabled]);

    const handleEmailToggle = () => {
        const nextValue = !emailEnabled;

        setEmailProcessing(true);

        router.patch(
            MailSettingsController.updatePreferences.url(),
            { email_notifications_enabled: nextValue },
            {
                preserveScroll: true,
                onSuccess: () => setEmailEnabled(nextValue),
                onFinish: () => setEmailProcessing(false),
            },
        );
    };

    const sendTestEmail = () => {
        setSendingTest(true);

        router.post(
            MailSettingsController.sendTest.url(),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSendingTest(false),
            },
        );
    };

    return (
        <>
            <Head title="Email settings" />

            <h1 className="sr-only">Email settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Email notifications"
                    description="Receive schedule alerts in your inbox when SMTP is configured."
                />

                <div className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {emailEnabled ? 'Email notifications enabled' : 'Email notifications disabled'}
                            </p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {mailConfigured
                                    ? emailEnabled
                                        ? 'Alerts will be sent to your account email address.'
                                        : 'Enable to receive notification emails.'
                                    : isAdmin
                                      ? 'Save valid SMTP settings below before email alerts can be delivered.'
                                      : 'An administrator must configure SMTP before email alerts are available.'}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant={emailEnabled ? 'outline' : 'default'}
                            className="h-11 rounded-xl px-6"
                            disabled={emailProcessing || !mailConfigured}
                            onClick={handleEmailToggle}
                        >
                            <Mail className="size-4" />
                            {emailProcessing
                                ? 'Saving…'
                                : emailEnabled
                                  ? 'Disable email'
                                  : 'Enable email'}
                        </Button>
                    </div>
                </div>

                {isAdmin && mailSettings && (
                    <>
                        <Heading
                            variant="small"
                            title="SMTP configuration"
                            description="Configure outgoing mail for notification emails. Password is stored encrypted."
                        />

                        <Form
                            {...MailSettingsController.update.form()}
                            options={{ preserveScroll: true }}
                            className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6"
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mailer">Mailer</Label>
                                        <Select
                                            value={mailer}
                                            onValueChange={(value) => setMailer(value as 'smtp' | 'log')}
                                        >
                                            <SelectTrigger id="mailer" className="h-11 rounded-xl">
                                                <SelectValue placeholder="Select mailer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="smtp">SMTP</SelectItem>
                                                <SelectItem value="log">Log (development)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="mailer" value={mailer} />
                                        <InputError message={errors.mailer} />
                                    </div>

                                    {mailer === 'smtp' && (
                                        <>
                                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="host">SMTP host</Label>
                                                    <Input
                                                        id="host"
                                                        name="host"
                                                        defaultValue={mailSettings.host ?? ''}
                                                        placeholder="smtp.mailgun.org"
                                                        className="h-11 rounded-xl"
                                                    />
                                                    <InputError message={errors.host} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="port">Port</Label>
                                                    <Input
                                                        id="port"
                                                        name="port"
                                                        type="number"
                                                        defaultValue={mailSettings.port}
                                                        className="h-11 rounded-xl"
                                                    />
                                                    <InputError message={errors.port} />
                                                </div>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input
                                                        id="username"
                                                        name="username"
                                                        defaultValue={mailSettings.username ?? ''}
                                                        autoComplete="off"
                                                        className="h-11 rounded-xl"
                                                    />
                                                    <InputError message={errors.username} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        placeholder={
                                                            mailSettings.has_password
                                                                ? 'Leave blank to keep current'
                                                                : 'SMTP password'
                                                        }
                                                        className="h-11 rounded-xl"
                                                    />
                                                    <InputError message={errors.password} />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="encryption">Encryption</Label>
                                                <Select
                                                    value={encryption}
                                                    onValueChange={(value) =>
                                                        setEncryption(value as 'tls' | 'ssl' | 'none')
                                                    }
                                                >
                                                    <SelectTrigger id="encryption" className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select encryption" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tls">TLS (port 587)</SelectItem>
                                                        <SelectItem value="ssl">SSL (port 465)</SelectItem>
                                                        <SelectItem value="none">None</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="encryption" value={encryption} />
                                                <InputError message={errors.encryption} />
                                            </div>
                                        </>
                                    )}

                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="from_address">From address</Label>
                                            <Input
                                                id="from_address"
                                                name="from_address"
                                                type="email"
                                                defaultValue={mailSettings.from_address ?? ''}
                                                placeholder="notifications@example.com"
                                                className="h-11 rounded-xl"
                                            />
                                            <InputError message={errors.from_address} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="from_name">From name</Label>
                                            <Input
                                                id="from_name"
                                                name="from_name"
                                                defaultValue={mailSettings.from_name ?? ''}
                                                placeholder="Overseas"
                                                className="h-11 rounded-xl"
                                            />
                                            <InputError message={errors.from_name} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" className="h-11 rounded-xl px-6" disabled={processing}>
                                            {processing ? 'Saving…' : 'Save SMTP settings'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </>
                )}

                <div className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Send test email</p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {mailConfigured
                                    ? 'Sends a test message to your account email to verify SMTP delivery.'
                                    : 'SMTP must be configured before sending a test email.'}
                                {mailSettings?.mailer === 'log' && mailConfigured
                                    ? ' With the log mailer, check storage/logs/laravel.log.'
                                    : ''}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-xl px-6"
                            disabled={sendingTest || !mailConfigured}
                            onClick={sendTestEmail}
                        >
                            <Mail className="size-4" />
                            {sendingTest ? 'Sending…' : 'Send test email'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

SmtpSettings.layout = {
    breadcrumbs: [
        {
            title: 'Email settings',
            href: editSmtp(),
        },
    ],
};
