import { useSessionStorage } from '@rocket.chat/fuselage-hooks';
import { useRole, useSetting } from '@rocket.chat/ui-contexts';
import React from 'react';

import { useAirGappedRestriction } from '../../hooks/useAirGappedRestriction';
import AirGappedRestrictionBanner from './AirGappedRestrictionBanner/AirGappedRestrictionBanner';
import StatusDisabledBanner from './StatusDisabledBanner';

const BannerSection = () => {
	const [isRestricted, isWarning, remainingDays] = useAirGappedRestriction();
	const isAdmin = useRole('admin');

	const [bannerDismissed, setBannerDismissed] = useSessionStorage('presence_cap_notifier', false);
	const presenceDisabled = useSetting<boolean>('Presence_broadcast_disabled');

	if ((isWarning || isRestricted) && isAdmin) {
		return <AirGappedRestrictionBanner isRestricted={isRestricted} remainingDays={remainingDays} />;
	}

	if (presenceDisabled && !bannerDismissed) {
		return <StatusDisabledBanner onDismiss={() => setBannerDismissed(true)} />;
	}

	return null;
};

export default BannerSection;
