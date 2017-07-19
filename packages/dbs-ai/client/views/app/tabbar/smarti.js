Template.dbsAI_smarti.onCreated(function() {
	this.helpRequest = new ReactiveVar(null);
	const instance = this;

	Meteor.subscribe('assistify:helpRequests', instance.data.rid); //not reactively needed, as roomId doesn't change

	this.autorun(() => {
		if (instance.data.rid) {
			const helpRequest = RocketChat.models.HelpRequests.findOneByRoomId(instance.data.rid);
			instance.helpRequest.set(helpRequest);
		}
	});

});

Template.dbsAI_smarti.onDestroyed(function() {
	clearTimeout(this.loading);
});

/**
 * Create Smarti (as soon as the script is loaded)
 */
Template.dbsAI_smarti.onRendered(function() {

	const self = this;

	function createSmarti() {
		if (window.SmartiWidget === undefined) {
			console.log('Smarti is undefined');
			self.loading = setTimeout(createSmarti, 200);
		} else {

			const DBS_AI_Redlink_URL =
				RocketChat.settings.get('DBS_AI_Redlink_URL').endsWith('/') ?
					RocketChat.settings.get('DBS_AI_Redlink_URL') :
					`${ RocketChat.settings.get('DBS_AI_Redlink_URL') }/`;

			const WEBSOCKET_URL =
				`ws${ RocketChat.settings.get('Site_Url').substring(4) }websocket/`;


			self.smarti = new window.SmartiWidget(self.find('.external-message'), {
				socketEndpoint: WEBSOCKET_URL,
				smartiEndpoint: DBS_AI_Redlink_URL,
				channel: self.data.rid,
				inputCssSelector: '.autogrow-shadow'
			});
		}
	}

	createSmarti();

});

Template.dbsAI_smarti.helpers({
	isLivechat() {
		const instance = Template.instance();
		return ChatSubscription.findOne({rid: instance.data.rid}).t === 'l';
	},
	/**
	This helper is needed in order to create an object which matches the actions bar importing parameters
	 */
	liveChatActions() {
		const instance = Template.instance();
		return { roomId: instance.data.rid };
	},
	helpRequestByRoom() {
		const instance = Template.instance();
		return instance.helpRequest.get();
	}
});

/**
 * Load Smarti script
 */
RocketChat.settings.onload('DBS_AI_Redlink_URL', function() {

	Meteor.call('getSmartiUiScript', function(error, script) {
		if (error) {
			console.error('could not load Smarti:', error);
		} else {
			// generate a script tag for smarti JS
			const doc = document;
			const smartiScriptTag = doc.createElement('script');
			smartiScriptTag.type = 'text/javascript';
			smartiScriptTag.async = true;
			smartiScriptTag.defer = true;
			smartiScriptTag.innerHTML = script;
			// insert the smarti script tag as first script tag
			const firstScriptTag = doc.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(smartiScriptTag, firstScriptTag);
			console.debug('loaded Smarti successfully');
		}
	});
});
