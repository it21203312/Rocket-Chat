import { Meteor } from 'meteor/meteor';

import { hasPermissionAsync } from '../../../../authorization/server/functions/hasPermission';
import { LivechatVisitors, Messages, LivechatRooms } from '../../../../models/server/raw';
import { canAccessRoomAsync } from '../../../../authorization/server/functions/canAccessRoom';

export async function findVisitorInfo({ userId, visitorId }) {
	if (!await hasPermissionAsync(userId, 'view-l-room')) {
		throw new Error('error-not-authorized');
	}

	const visitor = await LivechatVisitors.findOneById(visitorId);
	if (!visitor) {
		throw new Error('visitor-not-found');
	}

	return {
		visitor,
	};
}

export async function findVisitedPages({ userId, roomId, pagination: { offset, count, sort } }) {
	if (!await hasPermissionAsync(userId, 'view-l-room')) {
		throw new Error('error-not-authorized');
	}
	const room = await LivechatRooms.findOneById(roomId);
	if (!room) {
		throw new Error('invalid-room');
	}
	const cursor = Messages.findByRoomIdAndType(room._id, 'livechat_navigation_history', {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const total = await cursor.count();

	const pages = await cursor.toArray();

	return {
		pages,
		count: pages.length,
		offset,
		total,
	};
}

export async function findChatHistory({ userId, roomId, visitorId, text, closedChatsOnly, pagination: { offset, count, sort } }) {
	if (!await hasPermissionAsync(userId, 'view-l-room')) {
		throw new Error('error-not-authorized');
	}
	const room = await LivechatRooms.findOneById(roomId);
	if (!room) {
		throw new Error('invalid-room');
	}
	if (!await canAccessRoomAsync(room, { _id: userId })) {
		throw new Error('error-not-allowed');
	}

	const options = {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	};
	const cursor = closedChatsOnly ? LivechatRooms.findClosedByVisitorId(visitorId, options) : LivechatRooms.findByVisitorId(visitorId,options); 
	const total = await cursor.count();
	const history = await cursor.toArray();
	const resultArray = [];
	if (text !== undefined) {
		Meteor.runAsUser(userId, () => {
			history.map((val) => {
				const roomId = val._id;
				const count = 1;
				const result = Meteor.call('messageSearch', text, roomId, count).message.docs;
				if (result.length > 0) {
					result.map((e) => {
						resultArray.push(e);
					});
				}
			});
		});
	}
	return {
		history,
		count: history.length,
		offset,
		total,
		resultArray,
	};
}
