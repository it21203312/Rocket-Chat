import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { MarketplaceContext } from '../../../contexts/MarketplaceContext';
import PrivateEmptyState from './PrivateEmptyState';

describe('with private apps enabled', () => {
	const appRoot = mockAppRoot()
		.withTranslations('en', 'core', {
			Private_apps_upgrade_empty_state_title: 'Upgrade to unlock private apps',
			No_private_apps_installed: 'No private apps installed',
		})
		.wrap((children) => (
			<MarketplaceContext.Provider
				value={{
					apps: {
						status: 'success',
						data: {
							marketplace: [],
							installed: [],
							private: [],
						},
						error: undefined,
					},
					reload: () => Promise.resolve(),
					orchestrator: undefined,
					privateAppsEnabled: true,
				}}
			>
				{children}
			</MarketplaceContext.Provider>
		));

	it('should offer to upgrade to unlock private apps', () => {
		render(<PrivateEmptyState />, { wrapper: appRoot.build(), legacyRoot: true });

		expect(screen.getByRole('heading', { name: 'No private apps installed' })).toBeInTheDocument();
	});
});

describe('without private apps enabled', () => {
	const appRoot = mockAppRoot()
		.withTranslations('en', 'core', {
			Private_apps_upgrade_empty_state_title: 'Upgrade to unlock private apps',
			No_private_apps_installed: 'No private apps installed',
		})
		.wrap((children) => (
			<MarketplaceContext.Provider
				value={{
					apps: {
						status: 'success',
						data: {
							marketplace: [],
							installed: [],
							private: [],
						},
						error: undefined,
					},
					reload: () => Promise.resolve(),
					orchestrator: undefined,
					privateAppsEnabled: false,
				}}
			>
				{children}
			</MarketplaceContext.Provider>
		));

	it('should offer to upgrade to unlock private apps', () => {
		render(<PrivateEmptyState />, { wrapper: appRoot.build(), legacyRoot: true });

		expect(screen.getByRole('heading', { name: 'Upgrade to unlock private apps' })).toBeInTheDocument();
	});
});
