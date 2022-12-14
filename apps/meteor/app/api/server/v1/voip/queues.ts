import { Match, check } from 'meteor/check';
import type { IVoipConnectorResult, IQueueSummary, IQueueMembershipDetails, IQueueMembershipSubscription } from '@rocket.chat/core-typings';
import { Voip } from '@rocket.chat/core-sdk';

import { API } from '../../api';

API.v1.addRoute(
	'voip/queues.getSummary',
	{ authRequired: true, permissionsRequired: ['inbound-voip-calls'] },
	{
		async get() {
			const queueSummary = await Voip.getQueueSummary();
			return API.v1.success({ summary: queueSummary.result as IQueueSummary[] });
		},
	},
);

API.v1.addRoute(
	'voip/queues.getQueuedCallsForThisExtension',
	{ authRequired: true, permissionsRequired: ['inbound-voip-calls'] },
	{
		async get() {
			check(
				this.requestParams(),
				Match.ObjectIncluding({
					extension: String,
				}),
			);
			const membershipDetails: IVoipConnectorResult = await Voip.getQueuedCallsForThisExtension(this.requestParams());
			return API.v1.success(membershipDetails.result as IQueueMembershipDetails);
		},
	},
);

API.v1.addRoute(
	'voip/queues.getMembershipSubscription',
	{ authRequired: true, permissionsRequired: ['inbound-voip-calls'] },
	{
		async get() {
			check(
				this.requestParams(),
				Match.ObjectIncluding({
					extension: String,
				}),
			);
			const membershipDetails: IVoipConnectorResult = await Voip.getQueueMembership(this.requestParams());
			return API.v1.success(membershipDetails.result as IQueueMembershipSubscription);
		},
	},
);
