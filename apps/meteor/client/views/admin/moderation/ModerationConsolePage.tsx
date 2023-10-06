import { Tabs, TabsItem } from '@rocket.chat/fuselage';
import { useTranslation, useRouteParameter, useToastMessageDispatch, type TranslationKey } from '@rocket.chat/ui-contexts';
import React, { useCallback, useState } from 'react';

import Page from '../../../components/Page';
import { getPermaLink } from '../../../lib/getPermaLink';
import ModConsoleReportDetails from './ModConsoleReportDetails';
import ModerationConsoleTable from './ModerationConsoleTable';
import ModConsoleUsersTable from './UserReports/ModConsoleUsersTable';

const tabs = ['Messages', 'Users'];

const ModerationConsolePage = () => {
	const t = useTranslation();
	const context = useRouteParameter('context');
	const id = useRouteParameter('id');
	const dispatchToastMessage = useToastMessageDispatch();
	const [tab, setTab] = useState('Users');

	const handleRedirect = useCallback(
		async (mid: string) => {
			try {
				const permalink = await getPermaLink(mid);
				window.open(permalink, '_self');
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
		},
		[dispatchToastMessage],
	);

	const handleTabClick = useCallback((tab: string) => () => setTab(tab), [setTab]);

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Moderation')} />
				<Page.Content>
					<Tabs>
						{tabs.map((tabName) => (
							<TabsItem key={tabName || ''} selected={tab === tabName} onClick={handleTabClick(tabName)}>
								{t(`Reported_${tabName}` as TranslationKey)}
							</TabsItem>
						))}
					</Tabs>
					{tab === 'Messages' && <ModerationConsoleTable />} {tab === 'Users' && <ModConsoleUsersTable />}
				</Page.Content>
			</Page>
			{context === 'info' && id && <ModConsoleReportDetails userId={id} onRedirect={handleRedirect} default={tab} />}
		</Page>
	);
};

export default ModerationConsolePage;
