import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { lazy } from 'react';
import toastr from 'toastr';

import { KonchatNotification } from '../../app/ui/client';
import { handleError } from '../../app/utils/client';
import { IUser } from '../../definition/IUser';
import * as AppLayout from '../lib/appLayout';
import { createTemplateForComponent } from '../lib/portals/createTemplateForComponent';
import { renderRouteComponent } from '../lib/portals/renderRouteComponent';

FlowRouter.wait();

FlowRouter.route('/', {
	name: 'index',
	action() {
		AppLayout.render('main', { center: 'loading' });
		if (!Meteor.userId()) {
			return FlowRouter.go('home');
		}

		Tracker.autorun((c) => {
			if (FlowRouter.subsReady() === true) {
				Meteor.defer(() => {
					const user = Meteor.user() as IUser | null;
					if (user?.defaultRoom) {
						const room = user.defaultRoom.split('/');
						FlowRouter.go(room[0], { name: room[1] }, FlowRouter.current().queryParams);
					} else {
						FlowRouter.go('home');
					}
				});
				c.stop();
			}
		});
	},
});

FlowRouter.route('/login', {
	name: 'login',

	action() {
		FlowRouter.go('home');
	},
});

FlowRouter.route('/home', {
	name: 'home',

	action(_params, queryParams) {
		KonchatNotification.getDesktopPermission();
		if (queryParams?.saml_idp_credentialToken !== undefined) {
			const token = queryParams.saml_idp_credentialToken;
			FlowRouter.setQueryParams({
				// eslint-disable-next-line @typescript-eslint/camelcase
				saml_idp_credentialToken: null,
			});
			(Meteor as any).loginWithSamlToken(token, (error?: any) => {
				if (error) {
					if (error.reason) {
						toastr.error(error.reason);
					} else {
						handleError(error);
					}
				}

				AppLayout.render('main', { center: 'home' });
			});

			return;
		}

		AppLayout.render('main', { center: 'home' });
	},
});

FlowRouter.route('/directory/:tab?', {
	name: 'directory',
	action: () => {
		const DirectoryPage = createTemplateForComponent(
			'DirectoryPage',
			() => import('../views/directory/DirectoryPage'),
			{ attachment: 'at-parent' },
		);
		AppLayout.render('main', { center: DirectoryPage });
	},
	triggersExit: [
		(): void => {
			$('.main-content').addClass('rc-old');
		},
	],
});

FlowRouter.route('/omnichannel-directory/:tab?/:context?/:id?', {
	name: 'omnichannel-directory',
	action: () => {
		const OmnichannelDirectoryPage = createTemplateForComponent(
			'OmnichannelDirectoryPage',
			() => import('../views/omnichannel/directory/OmnichannelDirectoryPage'),
			{ attachment: 'at-parent' },
		);
		AppLayout.render('main', { center: OmnichannelDirectoryPage });
	},
	triggersExit: [
		(): void => {
			$('.main-content').addClass('rc-old');
		},
	],
});

FlowRouter.route('/account/:group?', {
	name: 'account',
	action: () => {
		renderRouteComponent(() => import('../views/account/AccountRoute'));
	},
	triggersExit: [
		(): void => {
			$('.main-content').addClass('rc-old');
		},
	],
});

FlowRouter.route('/terms-of-service', {
	name: 'terms-of-service',
	action: () => {
		Session.set('cmsPage', 'Layout_Terms_of_Service');
		AppLayout.render('cmsPage');
	},
});

FlowRouter.route('/privacy-policy', {
	name: 'privacy-policy',
	action: () => {
		Session.set('cmsPage', 'Layout_Privacy_Policy');
		AppLayout.render('cmsPage');
	},
});

FlowRouter.route('/legal-notice', {
	name: 'legal-notice',
	action: () => {
		Session.set('cmsPage', 'Layout_Legal_Notice');
		AppLayout.render('cmsPage');
	},
});

FlowRouter.route('/room-not-found/:type/:name', {
	name: 'room-not-found',
	action: ({ type, name } = {}) => {
		Session.set('roomNotFound', { type, name });
		AppLayout.render('main', { center: 'roomNotFound' });
	},
});

FlowRouter.route('/register/:hash', {
	name: 'register-secret-url',
	action: () => {
		AppLayout.render('secretURL');
	},
});

FlowRouter.route('/invite/:hash', {
	name: 'invite',
	action: () => {
		AppLayout.render('invite');
	},
});

FlowRouter.route('/setup-wizard/:step?', {
	name: 'setup-wizard',
	action: () => {
		const SetupWizardRoute = lazy(() => import('../views/setupWizard/SetupWizardRoute'));
		AppLayout.render({ component: SetupWizardRoute });
	},
});

FlowRouter.notFound = {
	action: (): void => {
		const NotFoundPage = lazy(() => import('../views/notFound/NotFoundPage'));
		AppLayout.render({ component: NotFoundPage });
	},
};

Meteor.startup(() => {
	FlowRouter.initialize();
});
