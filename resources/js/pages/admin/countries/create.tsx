import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { CountryForm } from '@/pages/admin/countries/country-form';

const ROUTES = {
    index: '/countries',
    store: '/countries',
} as const;

export default function CountriesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        iso2: '',
        dial_code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ROUTES.store);
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Countries">
            <Head title="New Country" />

            <CountryForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Create Country"
                title="New Country"
                description="Add a country with its display name, two-letter ISO code, and international dial prefix."
                cancelHref={ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
