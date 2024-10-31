import type { ILivechatVisitor, IOmnichannelSource } from '@rocket.chat/core-typings';

import type { CreateContactParams } from './createContact';
import { getContactManagerIdByUsername } from './getContactManagerIdByUsername';

export async function mapVisitorToContact(visitor: ILivechatVisitor, source: IOmnichannelSource): Promise<CreateContactParams> {
	return {
		name: visitor.name || visitor.username,
		emails: visitor.visitorEmails?.map(({ address }) => address),
		phones: visitor.phone?.map(({ phoneNumber }) => phoneNumber),
		unknown: true,
		channels: [
			{
				name: source.label || source.type.toString(),
				visitorId: visitor._id,
				blocked: false,
				verified: false,
				details: source,
			},
		],
		customFields: visitor.livechatData,
		contactManager: await getContactManagerIdByUsername(visitor.contactManager?.username),
	};
}
