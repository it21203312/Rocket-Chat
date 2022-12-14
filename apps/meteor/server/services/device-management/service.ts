import type { IDeviceManagementService } from '@rocket.chat/core-sdk';
import { ServiceClassInternal } from '@rocket.chat/core-sdk';

import { deviceManagementEvents } from './events';

export class DeviceManagementService extends ServiceClassInternal implements IDeviceManagementService {
	protected name = 'device-management';

	constructor() {
		super();

		this.onEvent('accounts.login', async (data) => {
			// TODO need to add loginToken to data
			deviceManagementEvents.emit('device-login', data);
		});
	}
}
