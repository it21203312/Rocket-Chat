import { Accordion, Button, FieldGroup, Paragraph } from '@rocket.chat/fuselage';
import React from 'react';

import { useTranslation } from '../../providers/TranslationProvider';
import { Setting } from './Setting';
import { useSection } from './SettingsState';

export function Section({ children, groupId, hasReset = true, help, sectionName, solo }) {
	const section = useSection(groupId, sectionName);
	const t = useTranslation();

	const handleResetSectionClick = () => {
		section.reset();
	};

	return <Accordion.Item
		data-qa-section={sectionName}
		noncollapsible={solo || !section.name}
		title={section.name && t(section.name)}
	>
		{help && <Paragraph hintColor>{help}</Paragraph>}

		<FieldGroup>
			{section.settings.map((settingId) => <Setting key={settingId} settingId={settingId} />)}

			{hasReset && section.canReset && <Button
				children={t('Reset_section_settings')}
				className='reset-group'
				danger
				data-section={section.name}
				ghost
				onClick={handleResetSectionClick}
			/>}

			{children}
		</FieldGroup>
	</Accordion.Item>;
}
