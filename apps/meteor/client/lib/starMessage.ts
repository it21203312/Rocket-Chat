import type { IMessage } from '@rocket.chat/core-typings';
import { Meteor } from 'meteor/meteor';

import { ChatMessage, ChatSubscription } from '../../app/models/client';
import { settings } from '../../app/settings/client';
import { t } from '../../app/utils/lib/i18n';
import { dispatchToastMessage } from './toast';

export const starMessage = (message: IMessage, starred: boolean) => {
	const uid = Meteor.userId();

	if (!uid) {
		throw new Error(t('error-starring-message'));
	}

	if (!ChatSubscription.findOne({ rid: message.rid })) {
		throw new Error(t('error-starring-message'));
	}

	if (!ChatMessage.findOneByRoomIdAndMessageId(message.rid, message._id)) {
		throw new Error(t('error-starring-message'));
	}

	if (!settings.get('Message_AllowStarring')) {
		throw new Error(t('error-starring-message'));
	}

	if (starred) {
		ChatMessage.update(
			{ _id: message._id },
			{
				$addToSet: {
					starred: { _id: uid },
				},
			},
		);
		dispatchToastMessage({ type: 'success', message: t('Message_has_been_starred') });
		return;
	}

	ChatMessage.update(
		{ _id: message._id },
		{
			$pull: {
				starred: { _id: uid },
			},
		},
	);
	dispatchToastMessage({ type: 'success', message: t('Message_has_been_unstarred') });
};
