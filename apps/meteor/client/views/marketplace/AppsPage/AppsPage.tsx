import React from 'react';
import { FormProvider } from 'react-hook-form';

import { Page } from '../../../components/Page';
import AppsPageContent from './AppsPageContent';
import AppsPageHeader from './AppsPageHeader';
import SearchFiltersForm, { useSearchFiltersForm } from './SearchFiltersForm';

const AppsPage = () => {
	const searchFiltersForm = useSearchFiltersForm();

	return (
		<Page background='tint'>
			<AppsPageHeader />
			<FormProvider {...searchFiltersForm}>
				<SearchFiltersForm />
				<AppsPageContent />
			</FormProvider>
		</Page>
	);
};

export default AppsPage;
