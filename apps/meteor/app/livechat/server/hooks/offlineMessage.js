import { callbacks } from '../../../../lib/callbacks';
import { settings } from '../../../settings/server';
import { Livechat } from '../lib/LivechatTyped';

callbacks.add(
	'livechat.offlineMessage',
	(data) => {
		if (!settings.get('Livechat_webhook_on_offline_msg')) {
			return data;
		}

		const postData = {
			type: 'LivechatOfflineMessage',
			sentAt: new Date(),
			visitor: {
				name: data.name,
				email: data.email,
			},
			message: data.message,
		};

		Promise.await(Livechat.sendRequest(postData));
	},
	callbacks.priority.MEDIUM,
	'livechat-send-email-offline-message',
);
