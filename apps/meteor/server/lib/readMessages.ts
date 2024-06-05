import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { NotificationQueue, Subscriptions } from '@rocket.chat/models';

import { notifyOnSubscriptionChangedByUserAndRoomId } from '../../app/lib/server/lib/notifyListener';
import { callbacks } from '../../lib/callbacks';

export async function readMessages(rid: IRoom['_id'], uid: IUser['_id'], readThreads: boolean): Promise<void> {
	await callbacks.run('beforeReadMessages', rid, uid);

	const projection = { ls: 1, tunread: 1, alert: 1, ts: 1 };
	const sub = await Subscriptions.findOneByRoomIdAndUserId(rid, uid, { projection });
	if (!sub) {
		throw new Error('error-invalid-subscription');
	}

	// do not mark room as read if there are still unread threads
	const alert = !!(sub.alert && !readThreads && sub.tunread && sub.tunread.length > 0);

	const setAsReadResponse = await Subscriptions.setAsReadByRoomIdAndUserId(rid, uid, readThreads, alert);
	if (setAsReadResponse.modifiedCount) {
		void notifyOnSubscriptionChangedByUserAndRoomId(uid, rid);
	}

	await NotificationQueue.clearQueueByUserId(uid);

	const lastSeen = sub.ls || sub.ts;
	callbacks.runAsync('afterReadMessages', rid, { uid, lastSeen });
}
