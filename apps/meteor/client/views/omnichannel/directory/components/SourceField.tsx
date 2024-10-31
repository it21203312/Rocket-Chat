import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { OmnichannelRoomIcon } from '../../../../components/RoomIcon/OmnichannelRoomIcon';
import Field from '../../components/Field';
import Info from '../../components/Info';
import Label from '../../components/Label';
import { useOmnichannelSourceName } from '../../hooks/useOmnichannelSourceName';

type SourceFieldProps = {
	room: IOmnichannelRoom;
};

const SourceField = ({ room }: SourceFieldProps) => {
	const { t } = useTranslation();
	const getSourceName = useOmnichannelSourceName();

	const defaultTypesVisitorData: {
		widget: string | undefined;
		email: string | undefined;
		sms: string;
		app: string;
		api: string;
		other: string;
	} = {
		widget: '',
		email: room?.source.id,
		sms: t('External'),
		app: room.source.label || t('External'),
		api: room.source.label || t('External'),
		other: t('External'),
	};

	return (
		<Field>
			<Label>{t('Channel')}</Label>
			<Info>
				<Box display='flex' alignItems='center'>
					<OmnichannelRoomIcon source={room.source} status={room.v.status} size='x24' />
					<Label mi={8} mbe='0'>
						{getSourceName(room.source)}
					</Label>
					{defaultTypesVisitorData[room.source.type]}
				</Box>
			</Info>
		</Field>
	);
};

export default SourceField;
