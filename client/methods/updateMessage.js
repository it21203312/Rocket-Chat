import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { TimeSync } from 'meteor/mizzao:timesync';
import { t } from 'meteor/rocketchat:utils';
import { ChatMessage } from 'meteor/rocketchat:models';
import { hasAtLeastOnePermission } from 'meteor/rocketchat:authorization';
import { settings } from 'meteor/rocketchat:settings';
import { callbacks } from 'meteor/rocketchat:callbacks';
import _ from 'underscore';
import moment from 'moment';
import toastr from 'toastr';

Meteor.methods({
	updateMessage(message) {
		if (!Meteor.userId()) {
			return false;
		}

		const originalMessage = ChatMessage.findOne(message._id);

		const hasPermission = hasAtLeastOnePermission('edit-message', message.rid);
		const editAllowed = settings.get('Message_AllowEditing');
		let editOwn = false;
		if (originalMessage.msg === message.msg) {
			return;
		}
		if (originalMessage && originalMessage.u && originalMessage.u._id) {
			editOwn = originalMessage.u._id === Meteor.userId();
		}

		const me = Meteor.users.findOne(Meteor.userId());

		if (!(hasPermission || (editAllowed && editOwn))) {
			toastr.error(t('error-action-not-allowed', { action: t('Message_editing') }));
			return false;
		}

		const blockEditInMinutes = settings.get('Message_AllowEditing_BlockEditInMinutes');
		if (_.isNumber(blockEditInMinutes) && blockEditInMinutes !== 0) {
			if (originalMessage.ts) {
				const msgTs = moment(originalMessage.ts);
				if (msgTs) {
					const currentTsDiff = moment().diff(msgTs, 'minutes');
					if (currentTsDiff > blockEditInMinutes) {
						toastr.error(t('error-message-editing-blocked'));
						return false;
					}
				}
			}
		}

		Tracker.nonreactive(function() {

			if (isNaN(TimeSync.serverOffset())) {
				message.editedAt = new Date();
			} else {
				message.editedAt = new Date(Date.now() + TimeSync.serverOffset());
			}

			message.editedBy = {
				_id: Meteor.userId(),
				username: me.username,
			};

			message = callbacks.run('beforeSaveMessage', message);
			const messageObject = { editedAt: message.editedAt, editedBy: message.editedBy, msg: message.msg };

			if (originalMessage.attachments) {
				if (originalMessage.attachments[0].description !== undefined) {
					delete messageObject.$set.msg;
				}
			}
			ChatMessage.update({
				_id: message._id,
				'u._id': Meteor.userId(),
			}, { $set : messageObject });
		});
	},
});
