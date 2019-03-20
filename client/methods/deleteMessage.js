import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ChatMessage } from 'meteor/rocketchat:models';
import { hasAtLeastOnePermission } from 'meteor/rocketchat:authorization';
import { settings } from 'meteor/rocketchat:settings';
import _ from 'underscore';
import moment from 'moment';

Meteor.methods({
	deleteMessage(message) {
		if (!Meteor.userId()) {
			return false;
		}

		let ref = message.ref;

		// We're now only passed in the `_id` property to lower the amount of data sent to the server
		message = ChatMessage.findOne({ _id: message._id });

		const hasPermission = hasAtLeastOnePermission('delete-message', message.rid);
		const forceDelete = hasAtLeastOnePermission('force-delete-message', message.rid);
		const deleteAllowed = settings.get('Message_AllowDeleting');
		let deleteOwn = false;

		if (message && message.u && message.u._id) {
			deleteOwn = message.u._id === Meteor.userId();
		}
		if (!(forceDelete || hasPermission || (deleteAllowed && deleteOwn))) {
			return false;
		}
		const blockDeleteInMinutes = settings.get('Message_AllowDeleting_BlockDeleteInMinutes');
		if (!forceDelete && _.isNumber(blockDeleteInMinutes) && blockDeleteInMinutes !== 0) {
			const msgTs = moment(message.ts);
			const currentTsDiff = moment().diff(msgTs, 'minutes');
			if (currentTsDiff > blockDeleteInMinutes) {
				return false;
			}


		}
		let parentMessage;
		let replyIds;
		if (ref) {
			parentMessage = ChatMessage.findOne({ _id: ref });
			let _id = message._id;
			if (message.file && message.file._id) {
				if (message.attachments && message.attachments[0] && message.attachments[0].title_link) {
					_id = message.attachments[0].title_link.split("/")[2];
				}
			}
			replyIds = _.without(parentMessage.customFields.replyIds, _id);
			Meteor.call('addMessageReply', { _id: parentMessage._id, customFields: { replyIds } });
		}


		Tracker.nonreactive(function() {
			ChatMessage.remove({
				_id: message._id,
				'u._id': Meteor.userId(),
			});
		});
	},
});
