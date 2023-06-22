import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { cronJobs } from '@rocket.chat/cron';
import type { IUser } from '@rocket.chat/core-typings';

import { BusinessHourManager } from './BusinessHourManager';
import { SingleBusinessHourBehavior } from './Single';
import { callbacks } from '../../../../lib/callbacks';
import { DefaultBusinessHour } from './Default';

export const businessHourManager = new BusinessHourManager(cronJobs);

Meteor.startup(async () => {
	const { BusinessHourBehaviorClass } = await callbacks.run('on-business-hour-start', {
		BusinessHourBehaviorClass: SingleBusinessHourBehavior,
	});
	businessHourManager.registerBusinessHourBehavior(new BusinessHourBehaviorClass());
	businessHourManager.registerBusinessHourType(new DefaultBusinessHour());

	// Note: This shouldn't happen directly on login, but after the login process has already finished
	// but meteor doesn't have "afterLogin" hooks
	Accounts.onLogin(async ({ user }: { user: IUser }) =>
		setTimeout(async () => {
			void (user?.roles?.includes('livechat-agent') && !user?.roles?.includes('bot') && businessHourManager.onLogin(user._id));
		}, 1000),
	);
});
