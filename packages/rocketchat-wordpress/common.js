/* globals CustomOAuth */

const config = {
	serverURL: '',
	identityPath: '/oauth/me',

	addAutopublishFields: {
		forLoggedInUser: ['services.wordpress'],
		forOtherUsers: ['services.wordpress.user_login']
	}
};

const WordPress = new CustomOAuth('wordpress', config);

const fillSettings = function() {
	if (RocketChat.settings.get('API_Wordpress_URL')) {
		config.serverURL = RocketChat.settings.get('API_Wordpress_URL');

		delete config.identityPath;
		delete config.identityTokenSentVia;
		delete config.authorizePath;
		delete config.tokenPath;
		delete config.scope;

		const serverType = RocketChat.settings.get('Accounts_OAuth_Wordpress_server_type');
		switch (serverType) {
			case 'custom':
				if (RocketChat.settings.get('Accounts_OAuth_Wordpress_identity_path')) {
					config.identityPath = RocketChat.settings.get('Accounts_OAuth_Wordpress_identity_path');
				}

				if (RocketChat.settings.get('Accounts_OAuth_Wordpress_identity_token_sent_via')) {
					config.identityTokenSentVia = RocketChat.settings.get('Accounts_OAuth_Wordpress_identity_token_sent_via');
				}

				if (RocketChat.settings.get('Accounts_OAuth_Wordpress_token_path')) {
					config.tokenPath = RocketChat.settings.get('Accounts_OAuth_Wordpress_token_path');
				}

				if (RocketChat.settings.get('Accounts_OAuth_Wordpress_authorize_path')) {
					config.authorizePath = RocketChat.settings.get('Accounts_OAuth_Wordpress_authorize_path');
				}

				if (RocketChat.settings.get('Accounts_OAuth_Wordpress_scope')) {
					config.scope = RocketChat.settings.get('Accounts_OAuth_Wordpress_scope');
				}
				break;
			case 'wordpress-com':
				config.identityPath = '/rest/v1/me';
				config.identityTokenSentVia = 'header';
				config.authorizePath = '/oauth2/authorize';
				config.tokenPath = '/oauth2/token';
				config.scope = 'auth';
				break;
			default:
				config.identityPath = '/oauth/me';
				break;
		}

		return WordPress.configure(config);
	}
};

if (Meteor.isServer) {
	Meteor.startup(function() {
		return fillSettings();
	});
} else {
	Meteor.startup(function() {
		return Tracker.autorun(function() {
			return fillSettings();
		});
	});
}
