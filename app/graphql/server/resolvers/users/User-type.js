import { Meteor } from 'meteor/meteor';
import property from 'lodash.property';

import { Avatars, Rooms } from '../../../../models';
import schema from '../../schemas/users/User-type.graphqls';

const resolver = {
	User: {
		id: property('_id'),
		status: ({ status }) => status.toUpperCase(),
		avatar: async ({ _id }) => {
			// XXX js-accounts/graphql#16
			const avatar = await Avatars.model.rawCollection().findOne({
				userId: _id,
			}, { fields: { url: 1 } });

			if (avatar) {
				return avatar.url;
			}
		},
		channels: Meteor.bindEnvironment(({ _id }) => Rooms.findBySubscriptionUserId(_id).fetch()),
		directMessages: ({ username }) => Rooms.findDirectRoomContainingUsername(username).fetch(),
	},
};

export {
	schema,
	resolver,
};
