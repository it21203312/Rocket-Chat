import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Roles } from '../../../models';
import { API } from '../api';
import { getUsersInRole, hasPermission } from '../../../authorization/server';
import { settings } from '../../../settings/server/index';
import { api } from '../../../../server/sdk/api';

API.v1.addRoute('roles.list', { authRequired: true }, {
	get() {
		const roles = Roles.find({}, { fields: { _updatedAt: 0 } }).fetch();

		return API.v1.success({ roles });
	},
});

API.v1.addRoute('roles.sync', { authRequired: true }, {
	get() {
		const { updatedSince } = this.queryParams;

		if (isNaN(Date.parse(updatedSince))) {
			throw new Meteor.Error('error-updatedSince-param-invalid', 'The "updatedSince" query parameter must be a valid date.');
		}

		return API.v1.success({
			roles: {
				update: Roles.findByUpdatedDate(new Date(updatedSince), { fields: API.v1.defaultFieldsToExclude }).fetch(),
				remove: Roles.trashFindDeletedAfter(new Date(updatedSince)).fetch(),
			},
		});
	},
});

API.v1.addRoute('roles.create', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			name: String,
			scope: Match.Maybe(String),
			description: Match.Maybe(String),
		});

		const roleData = {
			name: this.bodyParams.name,
			scope: this.bodyParams.scope,
			description: this.bodyParams.description,
		};

		if (!hasPermission(Meteor.userId(), 'access-permissions')) {
			throw new Meteor.Error('error-action-not-allowed', 'Accessing permissions is not allowed');
		}

		if (Roles.findOneByIdOrName(roleData.name)) {
			throw new Meteor.Error('error-duplicate-role-names-not-allowed', 'Role name already exists');
		}

		if (['Users', 'Subscriptions'].includes(roleData.scope) === false) {
			roleData.scope = 'Users';
		}

		const roleId = Roles.createWithRandomId(roleData.name, roleData.scope, roleData.description, false, roleData.mandatory2fa);

		if (settings.get('UI_DisplayRoles')) {
			api.broadcast('user.roleUpdate', {
				type: 'changed',
				_id: roleId,
			});
		}

		return API.v1.success({
			role: Roles.findOneByIdOrName(roleId, { fields: API.v1.defaultFieldsToExclude }),
		});
	},
});

API.v1.addRoute('roles.addUserToRole', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			roleName: String,
			username: String,
			roomId: Match.Maybe(String),
		});

		const user = this.getUserFromParams();

		Meteor.runAsUser(this.userId, () => {
			Meteor.call('authorization:addUserToRole', this.bodyParams.roleName, user.username, this.bodyParams.roomId);
		});

		return API.v1.success({
			role: Roles.findOneByIdOrName(this.bodyParams.roleName, { fields: API.v1.defaultFieldsToExclude }),
		});
	},
});

API.v1.addRoute('roles.getUsersInRole', { authRequired: true }, {
	get() {
		const { roomId, role } = this.queryParams;
		const { offset, count = 50 } = this.getPaginationItems();

		const fields = {
			name: 1,
			username: 1,
			emails: 1,
			avatarETag: 1,
		};

		if (!role) {
			throw new Meteor.Error('error-param-not-provided', 'Query param "role" is required');
		}
		if (!hasPermission(this.userId, 'access-permissions')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed');
		}
		if (roomId && !hasPermission(this.userId, 'view-other-user-channels')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed');
		}
		const users = getUsersInRole(role, roomId, {
			limit: count,
			sort: { username: 1 },
			skip: offset,
			fields,
		});
		return API.v1.success({ users: users.fetch(), total: users.count() });
	},
});

API.v1.addRoute('roles.update', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			roleId: String,
			name: Match.Maybe(String),
			scope: Match.Maybe(String),
			description: Match.Maybe(String),
		});

		const roleData = {
			roleId: this.bodyParams.roleId,
			name: this.bodyParams.name,
			scope: this.bodyParams.scope,
			description: this.bodyParams.description,
		};

		const role = Roles.findOneByIdOrName(roleData.roleId);

		if (!role) {
			throw new Meteor.Error('error-invalid-roleId', 'This role does not exist');
		}

		if (roleData.name) {
			const otherRole = Roles.findOneByIdOrName(roleData.name);
			if (otherRole && otherRole._id !== role.roleId) {
				throw new Meteor.Error('error-duplicate-role-names-not-allowed', 'Role name already exists');
			}
		}

		if (roleData.scope) {
			if (['Users', 'Subscriptions'].includes(roleData.scope) === false) {
				roleData.scope = 'Users';
			}
		}

		Roles.updateById(roleData.roleId, roleData.name, roleData.scope, roleData.description);

		if (settings.get('UI_DisplayRoles')) {
			api.broadcast('user.roleUpdate', {
				type: 'changed',
				_id: roleData.roleId,
			});
		}

		return API.v1.success({
			role: Roles.findOneByIdOrName(roleData.roleId, { fields: API.v1.defaultFieldsToExclude }),
		});
	},
});
