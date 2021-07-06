import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import _ from 'underscore';

import { call } from '../../ui-utils/client';
import { Messages } from '../../models/client';
import './messageThread.html';
import { normalizeThreadTitle } from '../../threads/client/lib/normalizeThreadTitle';

const findParentMessage = (() => {
	const waiting = [];
	let resolve;
	let pending = new Promise((r) => { resolve = r; });
	console.log('1222222');
	const getMessages = _.debounce(async function() {
		const _tmp = [...waiting];
		waiting.length = 0;
		resolve(call('getMessages', _tmp));
		pending = new Promise((r) => { resolve = r; });
	}, 500);

	const get = async (tmid) => {
		getMessages();
		const messages = await pending;
		return messages.find(({ _id }) => _id === tmid);
	};


	return async (tmid) => {
		const message = Messages.findOne({ _id: tmid });

		if (message) {
			return message;
		}

		if (waiting.indexOf(tmid) === -1) {
			waiting.push(tmid);
		}
		return get(tmid);
	};
})();

Template.messageThread.helpers({
	parentMessage() {
		const { parentMessage } = Template.instance();
		console.log('parent', parentMessage);
		if (parentMessage) {
			return normalizeThreadTitle(parentMessage.get());
		}
	},
});

Template.messageThread.onCreated(function() {
	this.parentMessage = new ReactiveVar();
	this.autorun(async () => {
		const { tmid } = Template.currentData();
		this.parentMessage.set(await findParentMessage(tmid));
	});
});
