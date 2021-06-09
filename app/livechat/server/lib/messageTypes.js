import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { actionLinks } from '../../../../server/utils/actionlinks';
import { Notifications } from '../../../../server/services/notifications';
import { Messages, LivechatRooms } from '../../../../server/models';
import { settings } from '../../../../server/settings';
import { Livechat } from './Livechat';

actionLinks.register('denyLivechatCall', function(message/* , params*/) {
	const user = Meteor.user();

	Messages.createWithTypeRoomIdMessageAndUser('command', message.rid, 'endCall', user);
	Notifications.notifyRoom(message.rid, 'deleteMessage', { _id: message._id });

	const language = user.language || settings.get('Language') || 'en';

	Livechat.closeRoom({
		user,
		room: LivechatRooms.findOneById(message.rid),
		comment: TAPi18n.__('Videocall_declined', { lng: language }),
	});
	Meteor.defer(() => {
		Messages.setHiddenById(message._id);
	});
});
