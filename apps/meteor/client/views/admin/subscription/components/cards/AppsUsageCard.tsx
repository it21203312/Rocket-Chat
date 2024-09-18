import { Box, ProgressBar, Skeleton } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { CardProps } from '../FeatureUsageCard';
import FeatureUsageCard from '../FeatureUsageCard';
import UpgradeButton from '../UpgradeButton';

type AppsUsageCardProps = {
	privateAppsLimit?: { value?: number; max: number };
	marketplaceAppsLimit?: { value?: number; max: number };
};

const AppsUsageCard = ({ privateAppsLimit, marketplaceAppsLimit }: AppsUsageCardProps): ReactElement => {
	const { t } = useTranslation();

	const marketplaceAppsEnabled = marketplaceAppsLimit?.value || 0;
	const marketplaceAppsLimitCount = marketplaceAppsLimit?.max || 5;
	const marketplaceAppsPercentage = Math.round((marketplaceAppsEnabled / marketplaceAppsLimitCount) * 100);

	const privateAppsEnabled = privateAppsLimit?.value || 0;
	const privateAppsLimitCount = privateAppsLimit?.max || 0;
	const privateAppsPercentage = Math.round((privateAppsEnabled / privateAppsLimitCount) * 100);

	const card: CardProps = {
		title: t('Apps'),
		infoText: (
			<Trans i18nKey='Apps_InfoText'>
				Community workspaces can enable up to 5 marketplace apps. Private apps can only be enabled in
				<Box is='a' href='https://www.rocket.chat/pricing' target='_blank' color='info'>
					premium plans
				</Box>
				.
			</Trans>
		),
		...((marketplaceAppsPercentage || 0) >= 80 && {
			upgradeButton: (
				<UpgradeButton target='app-usage-card' action='upgrade' small>
					{t('Upgrade')}
				</UpgradeButton>
			),
		}),
	};

	const privateAppsDisabled = privateAppsLimitCount === 0;
	const privateAppsTitle = privateAppsDisabled ? t('Private_apps_premium_message') : undefined;
	const privateAppsVariant = privateAppsDisabled || (privateAppsPercentage || 0) >= 80 ? 'danger' : 'success';
	const privateAppsFontColor = privateAppsDisabled || (privateAppsPercentage || 0) >= 80 ? 'font-danger' : 'status-font-on-success';

	if (!privateAppsLimit || !marketplaceAppsLimit) {
		return (
			<FeatureUsageCard card={card}>
				<Skeleton variant='rect' width='x112' height='x112' />
			</FeatureUsageCard>
		);
	}

	return (
		<FeatureUsageCard card={card}>
			<Box fontScale='c1' mb={12}>
				<Box display='flex' flexGrow='1' justifyContent='space-between' mbe={4}>
					<div>{t('Marketplace_apps')}</div>
					<Box color={(marketplaceAppsPercentage || 0) >= 80 ? 'font-danger' : 'status-font-on-success'}>
						{marketplaceAppsEnabled} / {marketplaceAppsLimitCount}
					</Box>
				</Box>

				<ProgressBar percentage={marketplaceAppsPercentage || 0} variant={(marketplaceAppsPercentage || 0) >= 80 ? 'danger' : 'success'} />
			</Box>
			<Box fontScale='c1' mb={12} title={privateAppsTitle}>
				<Box display='flex' flexGrow='1' justifyContent='space-between' mbe={4}>
					<div>{t('Private_apps')}</div>
					<Box color={privateAppsFontColor}>
						{privateAppsEnabled} / {privateAppsLimitCount}
					</Box>
				</Box>

				<ProgressBar percentage={privateAppsDisabled ? 100 : privateAppsPercentage || 0} variant={privateAppsVariant} />
			</Box>
		</FeatureUsageCard>
	);
};
export default AppsUsageCard;
