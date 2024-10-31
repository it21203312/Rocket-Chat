import type { RoomType } from '@rocket.chat/core-typings';
import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useEndpoint, useSetModal, useToastMessageDispatch, useRouter } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { UiTextContext } from '../../definition/IRoomTypeConfig';
import { GenericModalDoNotAskAgain } from '../components/GenericModal';
import { roomCoordinator } from '../lib/rooms/roomCoordinator';
import { useDontAskAgain } from './useDontAskAgain';

type RoomCloseProps = {
	rid: string;
	type: RoomType;
	name: string;
};

type RoomCloseOptions = {
	redirect?: boolean;
};

const CLOSE_ENDPOINTS_BY_ROOM_TYPE = {
	p: '/v1/groups.close', // private
	c: '/v1/channels.close', // channel
	d: '/v1/im.close', // direct message
	v: '/v1/channels.close', // omnichannel voip
	l: '/v1/groups.close', // livechat
} as const;

export const useRoomCloseAction = ({ rid, type, name }: RoomCloseProps, { redirect = true }: RoomCloseOptions = {}) => {
	const { t } = useTranslation();
	const setModal = useSetModal();
	const closeModal = useEffectEvent(() => setModal());
	const dispatchToastMessage = useToastMessageDispatch();
	const dontAskHideRoom = useDontAskAgain('hideRoom');
	const router = useRouter();

	const hideRoomEndpoint = useEndpoint('POST', CLOSE_ENDPOINTS_BY_ROOM_TYPE[type]);

	const hideRoom = useMutation({
		mutationFn: () => hideRoomEndpoint({ roomId: rid }),
		onSuccess: () => {
			if (redirect) {
				router.navigate('/home');
			}
		},
		onError: (error) => dispatchToastMessage({ type: 'error', message: error }),
		onSettled: () => closeModal(),
	});

	const handleHide = useEffectEvent(async () => {
		const warnText = roomCoordinator.getRoomDirectives(type).getUiText(UiTextContext.HIDE_WARNING);

		if (dontAskHideRoom) {
			hideRoom.mutate();
			return;
		}

		setModal(
			<GenericModalDoNotAskAgain
				variant='danger'
				confirmText={t('Yes_hide_it')}
				cancelText={t('Cancel')}
				onClose={closeModal}
				onCancel={closeModal}
				onConfirm={() => hideRoom.mutate()}
				dontAskAgain={{
					action: 'hideRoom',
					label: t('Hide_room'),
				}}
			>
				{t(warnText as TranslationKey, { postProcess: 'sprintf', sprintf: [name] })}
			</GenericModalDoNotAskAgain>,
		);
	});

	return handleHide;
};
