import { useRoute, useRouteParameter } from '@rocket.chat/ui-contexts';
import React from 'react';

import { useOmnichannelRoom } from '../../room/contexts/RoomContext';
import { useRoomToolbox } from '../../room/contexts/RoomToolboxContext';
import ContactInfo from './ContactInfo';
import ContactEditWithData from './EditContactInfoWithData';

const ContactInfoRouter = () => {
	const room = useOmnichannelRoom();
	const { closeTab } = useRoomToolbox();

	const liveRoute = useRoute('live');
	const context = useRouteParameter('context');

	const handleCloseEdit = (): void => {
		liveRoute.push({ id: room._id, tab: 'contact-profile' });
	};

	const {
		v: { contactId },
	} = room;

	if (context === 'edit') {
		return <ContactEditWithData id={contactId || ''} onClose={closeTab} onCancel={handleCloseEdit} />;
	}

	return <ContactInfo id={contactId || ''} onClose={closeTab} />;
};

export default ContactInfoRouter;
