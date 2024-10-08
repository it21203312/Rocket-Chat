import { GenericMenu } from '@rocket.chat/ui-client';
import type { GenericMenuItemProps } from '@rocket.chat/ui-client';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import { isPromptButton, type FormattingButton } from '../../../../../../app/ui-message/client/messageBox/messageBoxFormatting';
import type { ComposerAPI } from '../../../../../lib/chats/ChatAPI';

type FormattingToolbarDropdownProps = {
	composer: ComposerAPI;
	items: FormattingButton[];
	disabled: boolean;
};

const FormattingToolbarDropdown = ({ composer, items, disabled }: FormattingToolbarDropdownProps) => {
	const t = useTranslation();

	const formattingItems: GenericMenuItemProps[] = items.map((formatter) => {
		const handleFormattingAction = () => {
			if ('link' in formatter) {
				window.open(formatter.link, '_blank', 'rel=noreferrer noopener');
				return;
			}
			if (isPromptButton(formatter)) {
				return formatter.prompt(composer);
			}
			composer.wrapSelection(formatter.pattern);
		};

		return {
			id: `formatter-${formatter.label}`,
			content: t(formatter.label),
			icon: 'icon' in formatter ? formatter.icon : 'link',
			onClick: () => handleFormattingAction(),
		};
	});

	const sections = [{ title: t('Message_Formatting_Toolbox'), items: formattingItems }];

	return <GenericMenu title={t('Message_Formatting_Toolbox')} disabled={disabled} detached icon='meatballs' sections={sections} />;
};

export default FormattingToolbarDropdown;
