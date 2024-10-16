import type { Locator, Page } from '@playwright/test';

export class OmnichannelSection {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get omnichannelToolbar(): Locator {
		return this.page.getByRole('navigation', { name: 'header' }).getByRole('toolbar', { name: 'Omnichannel' });
	}

	get element(): Locator {
		return this.page.locator('div[data-qa-id="omncSection"]');
	}

	get btnVoipToggle(): Locator {
		return this.page.locator('role=button[name="Enable/Disable VoIP"]');
	}

	get btnDialpad(): Locator {
		return this.omnichannelToolbar.getByRole('button', { name: 'Open Dialpad' });
	}

	get btnContactCenter(): Locator {
		return this.omnichannelToolbar.getByRole('button', { name: 'Contacts' });
	}
}
