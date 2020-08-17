import { Meteor } from 'meteor/meteor';

import { Livechat } from '../lib/Livechat';
import { hasPermission } from '../../../authorization';
import { Users } from '../../../models/server/models/Users';

Meteor.methods({
	'livechat:changeLivechatStatus'({ status, agentId = Meteor.userId() }) {
		const uid = Meteor.userId();

		if (!uid || !agentId) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:changeLivechatStatus' });
		}

		const agent = Users.findOneAgentById({ _id: agentId }, { fields: { statusLivechat: 1 } });
		const newStatus = status || agent.statusLivechat === 'available' ? 'not-available' : 'available';

		if (!agent) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveAgentInfo' });
		}

		if (agentId !== uid) {
			if (!hasPermission(uid, 'manage-livechat-agents')) {
				throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveAgentInfo' });
			}
			return Livechat.setUserStatusLivechat(agentId, newStatus);
		}

		if (!Livechat.allowAgentChangeServiceStatus(newStatus, agentId)) {
			throw new Meteor.Error('error-business-hours-are-closed', 'Not allowed', { method: 'livechat:changeLivechatStatus' });
		}

		return Livechat.setUserStatusLivechat(agentId, newStatus);
	},
});
