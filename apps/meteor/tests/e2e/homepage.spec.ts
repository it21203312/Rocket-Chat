import type { Page } from '@playwright/test';

import { expect, test } from './utils/test';

const CardIds = {
	Users: 'homepage-add-users-card',
	Chan: 'homepage-create-channels-card',
	Rooms: 'homepage-join-rooms-card',
	Mobile: 'homepage-mobile-apps-card',
	Desktop: 'homepage-desktop-apps-card',
	Docs: 'homepage-documentation-card',
};

const expectCardsToExist = async (page: Page, dataQaIds: string[]): Promise<void> => {
	for await (const dataQaId of dataQaIds) {
		await expect(page.locator(`[data-qa-id="${dataQaId}"]`)).toBeVisible();
	}
};

const EDIT_LAYOUT_PERMISSIONS = ['view-privileged-setting', 'edit-privileged-setting', 'manage-selected-settings'];

const CARDS_PERMS = ['create-c', 'create-p', 'view-user-administration'];

test.use({ storageState: 'admin-session.json' });

test.describe.serial('homepage', () => {
	let regularUserPage: Page;

	test.beforeAll(async ({ browser }) => {
		regularUserPage = await browser.newPage({ storageState: 'user2-session.json' });
		await regularUserPage.goto('/home');
		await regularUserPage.waitForSelector('[data-qa-id="home-header"]');
	});

	test('expect show customize button if permission granted', async ({ api }) => {
		expect(
			(
				await api.post('/permissions.update', { permissions: EDIT_LAYOUT_PERMISSIONS.map((_id) => ({ _id, roles: ['admin', 'user'] })) })
			).status(),
		).toBe(200);

		await expect(regularUserPage.locator('[data-qa-id="home-header-customize-button"]')).toBeVisible();

		expect(
			(await api.post('/permissions.update', { permissions: EDIT_LAYOUT_PERMISSIONS.map((_id) => ({ _id, roles: ['admin'] })) })).status(),
		).toBe(200);

		expect(regularUserPage.locator('[data-qa-id="home-header-customize-button"]')).not.toBeVisible();
	});

	test('expect not show Cards that need special permissions', async ({ api }) => {
		expect(
			(await api.post('/permissions.update', { permissions: CARDS_PERMS.map((_id) => ({ _id, roles: ['admin', 'user'] })) })).status(),
		).toBe(200);

		await expectCardsToExist(regularUserPage, Object.values(CardIds));

		expect((await api.post('/permissions.update', { permissions: CARDS_PERMS.map((_id) => ({ _id, roles: ['admin'] })) })).status()).toBe(
			200,
		);

		await expectCardsToExist(regularUserPage, [CardIds.Desktop, CardIds.Docs, CardIds.Mobile, CardIds.Rooms]);

		await expect(regularUserPage.locator(`[data-qa-id="${CardIds.Users}"]`)).not.toBeVisible();

		await expect(regularUserPage.locator(`[data-qa-id="${CardIds.Chan}"]`)).not.toBeVisible();
	});

	test('expect welcome text to use Site Name setting', async ({ api }) => {
		await expect(regularUserPage.locator('[data-qa-id="homepage-welcome-text"]')).toContainText('Rocket.Chat');

		expect((await api.post('/settings/Site_Name', { value: 'NewSiteName' })).status()).toBe(200);

		await expect(regularUserPage.locator('[data-qa-id="homepage-welcome-text"]')).toContainText('NewSiteName');
	});

	test('expect header text to use Home Title setting', async ({ api }) => {
		await expect(regularUserPage.locator('[data-qa-type="PageHeader-title"]')).toContainText('Home');

		expect((await api.post('/settings/Layout_Home_Title', { value: 'NewTitle' })).status()).toBe(200);

		await expect(regularUserPage.locator('[data-qa-type="PageHeader-title"]')).toContainText('NewTitle');
	});

	test('expect switch to custom homepage and display custom text', async ({ api }) => {
		const responseLayoutCustomBody = await api.post('/settings/Layout_Custom_Body', { value: true });
		const responseLayoutHomeBody = await api.post('/settings/Layout_Home_Body', {
			value: '<span data-qa-id="custom-body-span">Hello</span>',
		});

		expect(responseLayoutCustomBody.status()).toBe(200);
		expect(responseLayoutHomeBody.status()).toBe(200);

		await regularUserPage.goto('/home');

		await expect(regularUserPage.locator('[data-qa-id="custom-body-span"]')).toContainText('Hello');
	});
});
