import type { LicenseLimitKind } from '../definition/ILicenseV3';
import type { LimitContext } from '../definition/LimitContext';
import type { LicenseManager } from '../license';
import { logger } from '../logger';
import { applyPendingLicense, hasPendingLicense } from '../pendingLicense';

export function setLicenseLimitCounter<T extends LicenseLimitKind>(
	this: LicenseManager,
	limitKey: T,
	fn: (context?: LimitContext<T>) => Promise<number> | number,
) {
	this.dataCounters.set(limitKey, fn as (context?: LimitContext<LicenseLimitKind>) => Promise<number>);

	if (hasPendingLicense.call(this) && hasAllDataCounters.call(this)) {
		void applyPendingLicense.call(this);
	}
}

export async function getCurrentValueForLicenseLimit<T extends LicenseLimitKind>(
	this: LicenseManager,
	limitKey: T,
	context?: Partial<LimitContext<T>>,
): Promise<number> {
	const counterFn = this.dataCounters.get(limitKey);
	if (!counterFn) {
		logger.error({ msg: 'Unable to validate license limit due to missing data counter.', limitKey });
		throw new Error('Unable to validate license limit due to missing data counter.');
	}

	const extraCount = context?.extraCount || 0;

	if (this.countersCache.has(limitKey)) {
		return (this.countersCache.get(limitKey) as number) + extraCount;
	}

	const count = await counterFn(context as LimitContext<LicenseLimitKind> | undefined);
	this.countersCache.set(limitKey, count);

	return count + extraCount;
}

export function hasAllDataCounters(this: LicenseManager) {
	return (
		['activeUsers', 'guestUsers', 'roomsPerGuest', 'privateApps', 'marketplaceApps', 'monthlyActiveContacts'] as LicenseLimitKind[]
	).every((limitKey) => this.dataCounters.has(limitKey));
}
