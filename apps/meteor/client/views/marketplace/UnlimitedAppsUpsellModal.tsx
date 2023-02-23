import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { useCallback } from 'react';

import UpsellModal from '../../components/UpsellModal';

export type UnlimitedAppsUpsellModalProps = {
	onClose: () => void;
};

const UnlimitedAppsUpsellModal = ({ onClose }: UnlimitedAppsUpsellModalProps) => {
	const t = useTranslation();
	const cloudWorkspaceHadTrial = useSetting('Cloud_Workspace_Had_Trial') as boolean;
	const urls = {
		goFullyFeaturedRegistered: 'admin/upgrade/go-fully-featured-registered',
		talkToSales: 'https://www.rocket.chat/sales-contact',
	};

	const goFullyFeaturedRegistered = useCallback(() => {
		window.open(urls.goFullyFeaturedRegistered, '_self');
		onClose();
	}, [onClose, urls.goFullyFeaturedRegistered]);

	const goToTalkSales = useCallback(() => {
		window.open(urls.talkToSales, '_blank');
		onClose();
	}, [onClose, urls.talkToSales]);

	return (
		<UpsellModal
			title={t('Enable_unlimited_apps')}
			img='images/unlimited-apps-modal.svg'
			subtitle={t('Get_all_apps')}
			description={!cloudWorkspaceHadTrial ? t('Workspaces_on_community_edition_trial_on') : t('Workspaces_on_community_edition_trial_off')}
			confirmText={!cloudWorkspaceHadTrial ? t('Start_free_trial') : t('Learn_more')}
			cancelText={t('Talk_to_sales')}
			onConfirm={goFullyFeaturedRegistered}
			onCancel={goToTalkSales}
			onClose={onClose}
		/>
	);
};

export default UnlimitedAppsUpsellModal;
