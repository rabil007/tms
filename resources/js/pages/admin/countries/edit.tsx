import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { CountryForm } from '@/pages/admin/countries/country-form';

const ROUTES = {
    index: '/countries',
    update: (id: number) => `/countries/${id}`,
} as const;

type Country = { id: number; name: string; iso2: string; dial_code: string };

export default function CountriesEdit({ country }: { country: Country }) {
    const { data, setData, put, processing, errors } = useForm({
        name: country.name,
        iso2: country.iso2,
        dial_code: country.dial_code,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ROUTES.update(country.id));
    };

    return (
        <ModulePageLayout backHref={ROUTES.index} backLabel="Countries">
            <Head title="Edit Country" />

            <CountryForm
                data={data}
                errors={errors}
                processing={processing}
                submitLabel="Save Changes"
                title="Edit Country"
                description={`Update the name, ISO code, and dial prefix for ${country.name}.`}
                cancelHref={ROUTES.index}
                onChange={setData}
                onSubmit={submit}
            />
        </ModulePageLayout>
    );
}
