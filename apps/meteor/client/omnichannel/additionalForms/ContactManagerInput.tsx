import { Field } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import AutoCompleteAgent from '../../components/AutoCompleteAgent';
import { useHasLicenseModule } from '../../hooks/useHasLicenseModule';

type ContactManagerInputProps = {
	value: string;
	handler: (currentValue: string) => void;
};

export const ContactManagerInput = ({ value: userId, handler }: ContactManagerInputProps) => {
	const t = useTranslation();
	const hasLicense = useHasLicenseModule('livechat-enterprise');

	if (!hasLicense) {
		return null;
	}

	return (
		<Field>
			<Field.Label>{t('Contact_Manager')}</Field.Label>
			<Field.Row>
				<AutoCompleteAgent haveNoAgentsSelectedOption value={userId} onChange={handler} />
			</Field.Row>
		</Field>
	);
};

export default ContactManagerInput;