import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { hasRole } from '../../app/authorization/client';
import { settings } from '../../app/settings/client';
import { navigate } from '../lib/router';

Meteor.startup(() => {
	Tracker.autorun(() => {
		const userId = Meteor.userId();
		const setupWizardState = settings.get('Show_Setup_Wizard');

		const isWizardInProgress = userId && hasRole(userId, 'admin') && setupWizardState === 'in_progress';
		const mustRedirect = (!userId && setupWizardState === 'pending') || isWizardInProgress;

		if (mustRedirect) {
			navigate('/setup-wizard');
		}
	});
});
