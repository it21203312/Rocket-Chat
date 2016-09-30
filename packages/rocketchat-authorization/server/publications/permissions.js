Meteor.methods({
	'permissions/get'(updatedAt) {
		this.unblock();

		const records = RocketChat.cache.Permissions.find().fetch();

		if (updatedAt instanceof Date) {
			return {
				update: records.filter((record) => {
					return record._updatedAt > updatedAt;
				}),
				remove: RocketChat.models.Permissions.trashFindDeletedAfter(updatedAt, {}, {fields: {_id: 1, _deletedAt: 1}}).fetch()
			};
		}

		return records;
	}
});


RocketChat.cache.Permissions.on('changed', (type, permission) => {
	RocketChat.Notifications.notifyAllInThisInstance('permissions-changed', type, permission);
});
