import { Meteor } from 'meteor/meteor';
import { Users } from 'meteor/rocketchat:models';

Meteor.methods({
	'e2e.setUserPublicAndPrivateKeys'({ public_key, private_key }) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'e2e.setUserPublicAndPrivateKeys' });
		}

		return Users.setE2EPublicAndPivateKeysByUserId(userId, { public_key, private_key });
	},
});
