import { Form, Head } from '@inertiajs/react';
import ApplicationSettingsController from '@/actions/App/Http/Controllers/Settings/ApplicationSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit as editApplication } from '@/routes/application';

export default function ApplicationSettings({
    applicationName,
}: {
    applicationName: string;
}) {
    return (
        <>
            <Head title="Application settings" />

            <h1 className="sr-only">Application settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Application"
                    description="Update the name shown across the app, browser tabs, notifications, and install prompts."
                />

                <Form
                    action={ApplicationSettingsController.update.patch()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="application-name">
                                    Application name
                                </Label>
                                <Input
                                    id="application-name"
                                    name="name"
                                    defaultValue={applicationName}
                                    required
                                    maxLength={100}
                                    placeholder="Overseas"
                                    className="h-11 rounded-xl"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl"
                            >
                                Save
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ApplicationSettings.layout = {
    breadcrumbs: [
        {
            title: 'Application settings',
            href: editApplication(),
        },
    ],
};
