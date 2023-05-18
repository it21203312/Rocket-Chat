import { SHA256 } from '@rocket.chat/sha256';
import { Meteor } from 'meteor/meteor';

import TwoFactorModal from '../../components/TwoFactorModal';
import { imperativeModal } from '../imperativeModal';
import { isTotpInvalidError, isTotpRequiredError } from './utils';
import { t } from '../../../app/utils/lib/i18n';

const twoFactorMethods = ['totp', 'email', 'password'] as const;

type TwoFactorMethod = (typeof twoFactorMethods)[number];

const isTwoFactorMethod = (method: string): method is TwoFactorMethod => twoFactorMethods.includes(method as TwoFactorMethod);

const hasRequiredTwoFactorMethod = (
	error: Meteor.Error,
): error is Meteor.Error & { details: { method: TwoFactorMethod; emailOrUsername?: string } } => {
	const details = error.details as unknown;

	return (
		typeof details === 'object' &&
		details !== null &&
		typeof (details as { method: unknown }).method === 'string' &&
		isTwoFactorMethod((details as { method: string }).method)
	);
};

function assertModalProps(props: {
	method: TwoFactorMethod;
	emailOrUsername?: string;
}): asserts props is { method: 'totp' } | { method: 'password' } | { method: 'email'; emailOrUsername: string } {
	if (props.method === 'email' && typeof props.emailOrUsername !== 'string') {
		throw new Error('Invalid Two Factor method');
	}
}

export async function process2faReturn({
	error,
	result,
	originalCallback,
	onCode,
	emailOrUsername,
}: {
	error: unknown;
	result: unknown;
	originalCallback: {
		(error: unknown): void;
		(error: unknown, result: unknown): void;
	};
	onCode: (code: string, method: string) => void;
	emailOrUsername: string | null | undefined;
}): Promise<void> {
	if (!(isTotpRequiredError(error) || isTotpInvalidError(error)) || !hasRequiredTwoFactorMethod(error)) {
		originalCallback(error, result);
		return;
	}

	const props = {
		method: error.details.method,
		emailOrUsername: emailOrUsername || error.details.emailOrUsername || Meteor.user()?.username,
		// eslint-disable-next-line no-nested-ternary
		invalidAttempt: isTotpInvalidError(error),
	};

	try {
		const code = await invokeTwoFactorModal(props);

		onCode(code, props.method);
	} catch (error) {
		process2faReturn({
			error,
			result,
			originalCallback,
			onCode,
			emailOrUsername,
		});
	}
}

export async function process2faAsyncReturn({
	error,
	onCode,
	emailOrUsername,
}: {
	error: unknown;
	onCode: (code: string, method: string) => unknown | Promise<unknown>;
	emailOrUsername: string | null | undefined;
}): Promise<unknown> {
	// if the promise is rejected, we need to check if it's a 2fa error
	// if it's not a 2fa error, we reject the promise
	if (!(isTotpRequiredError(error) || isTotpInvalidError(error)) || !hasRequiredTwoFactorMethod(error)) {
		throw error;
	}

	const props = {
		method: error.details.method,
		emailOrUsername: emailOrUsername || error.details.emailOrUsername || Meteor.user()?.username,
		// eslint-disable-next-line no-nested-ternary
		invalidAttempt: isTotpInvalidError(error),
	};

	assertModalProps(props);

	try {
		const code = await invokeTwoFactorModal(props);

		return onCode(code, props.method);
	} catch (error) {
		return process2faAsyncReturn({
			error,
			onCode,
			emailOrUsername,
		});
	}
}

export const invokeTwoFactorModal = async (props: {
	method: 'totp' | 'email' | 'password';
	emailOrUsername?: string | undefined;
	invalidAttempt?: boolean;
}) => {
	assertModalProps(props);

	return new Promise<string>((resolve, reject) => {
		imperativeModal.open({
			component: TwoFactorModal,
			props: {
				...props,
				onConfirm: (code: string, method: string): void => {
					imperativeModal.close();
					resolve(method === 'password' ? SHA256(code) : code);
				},
				onClose: (): void => {
					imperativeModal.close();
					reject(new Meteor.Error('totp-canceled'));
				},
			},
		});
	});
};
