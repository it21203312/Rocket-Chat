import { test, expect } from '@playwright/test';

import { Global, LoginPage } from './pageobjects';
import { VALID_EMAIL, INVALID_EMAIL, INVALID_EMAIL_WITHOUT_MAIL_PROVIDER } from './utils/mocks/userAndPasswordMock';

test.describe('[Forgot Password]', () => {
	let loginPage: LoginPage;
	let global: Global;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		global = new Global(page);

		await page.goto('/');
		await loginPage.btnForgotPassword.click();
	});

	test('expect be required', async () => {
		loginPage.btnSubmit.click();

		await expect(loginPage.emailInvalidText).toBeVisible();
	});

	test('expect invalid for email without domain', async () => {
		await loginPage.emailField.type(INVALID_EMAIL_WITHOUT_MAIL_PROVIDER);
		await loginPage.btnSubmit.click();
		await expect(loginPage.emailInvalidText).toBeVisible();
	});

	test('expect be invalid for email with invalid domain', async () => {
		await loginPage.emailField.type(INVALID_EMAIL);
		await loginPage.btnSubmit.click();
		await expect(loginPage.emailInvalidText).toBeVisible();
	});

	test('expect user type a valid email', async () => {
		await loginPage.emailField.type(VALID_EMAIL);
		await loginPage.btnSubmit.click();
		await expect(global.getToastBarSuccess).toBeVisible();
	});
});
