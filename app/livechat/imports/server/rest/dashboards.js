import { check } from 'meteor/check';

import { API } from '../../../../api';
import { hasPermission } from '../../../../authorization/server';
import {
	findAllChatsStatus,
	getProductivityMetrics,
	getConversationsMetrics,
	findAllChatMetricsByAgent,
	findAllAgentsStatus,
	findAllChatMetricsByDepartment,
	findAllResponseTimeMetrics,
} from '../../../server/lib/analytics/dashboards';

API.v1.addRoute('livechat/analytics/dashboards/conversation-totalizers', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);

		const totalizers = getConversationsMetrics({ start, end });
		return API.v1.success(totalizers);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/productivity-totalizers', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);

		const totalizers = getProductivityMetrics({ start, end });

		return API.v1.success(totalizers);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatsStatus({ start, end });

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats-per-agent', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatMetricsByAgent({ start, end });

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/agents-status', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		const result = findAllAgentsStatus({});

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/chats-per-department', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllChatMetricsByDepartment({ start, end });

		return API.v1.success(result);
	},
});

API.v1.addRoute('livechat/analytics/dashboards/charts/timings', { authRequired: true }, {
	get() {
		if (!hasPermission(this.userId, 'view-livechat-manager')) {
			return API.v1.unauthorized();
		}
		let { start, end } = this.requestParams();
		check(start, String);
		check(end, String);

		if (isNaN(Date.parse(start))) {
			return API.v1.failure('The "start" query parameter must be a valid date.');
		}
		start = new Date(start);

		if (isNaN(Date.parse(end))) {
			return API.v1.failure('The "end" query parameter must be a valid date.');
		}
		end = new Date(end);
		const result = findAllResponseTimeMetrics({ start, end });

		return API.v1.success(result);
	},
});
