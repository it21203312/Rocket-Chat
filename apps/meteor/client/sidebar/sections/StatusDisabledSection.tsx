import { SidebarBanner } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useSetModal, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import GenericModal from '../../components/GenericModal';

const StatusDisabledSection = () => {
	const t = useTranslation();
	const userStatusRoute = useRoute('user-status');
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const handleGoToSettings = useMutableCallback(() => {
		userStatusRoute.push({});
		closeModal();
	});

	return (
		<SidebarBanner
			title={t('User_status_temporarily_disabled')}
			actionText={t('Learn_more')}
			onClose={() => undefined} // TO DO: dismiss warning and close
			onClick={() =>
				setModal(
					<GenericModal
						title={t('User_status_disabled_learn_more')}
						cancelText={t('Close')}
						confirmText={t('Go_to_workspace_settings')}
						children={t('User_status_disabled_learn_more_description')}
						onConfirm={handleGoToSettings}
						onClose={closeModal}
						onCancel={closeModal}
						icon={null}
						variant='warning'
					/>,
				)
			}
		/>
	);
};

export default StatusDisabledSection;
