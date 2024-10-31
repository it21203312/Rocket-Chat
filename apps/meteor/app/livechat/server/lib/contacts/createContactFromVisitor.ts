import type { ILivechatVisitor, IOmnichannelSource } from '@rocket.chat/core-typings';
import { LivechatRooms } from '@rocket.chat/models';

import { createContact } from './createContact';
import { mapVisitorToContact } from './mapVisitorToContact';

export async function createContactFromVisitor(
	visitor: ILivechatVisitor,
	source: IOmnichannelSource,
	useVisitorId = false,
): Promise<string> {
	const contactData = await mapVisitorToContact(visitor, source);

	const contactId = await createContact(contactData, useVisitorId ? visitor._id : undefined);

	await LivechatRooms.setContactIdByVisitorIdOrToken(contactId, visitor._id, visitor.token);

	return contactId;
}
