import { Box, Margins, Tag } from '@rocket.chat/fuselage';
import React, { memo } from 'react';

import MarkdownText from '../../../../components/MarkdownText';
import UTCClock from '../../../../components/UTCClock';
import UserCard from '../../../../components/UserCard';
import VerticalBar from '../../../../components/VerticalBar';
import { useTranslation } from '../../../../contexts/TranslationContext';
import { useTimeAgo, useShortTimeAgo } from '../../../../hooks/useTimeAgo';
import InfoPanel from '../../../InfoPanel';
import Avatar from './Avatar';

function UserInfo({
	username,
	bio,
	email,
	verified,
	showRealNames,
	status,
	phone,
	customStatus,
	roles = [],
	lastLogin,
	createdAt,
	utcOffset,
	customFields = [],
	name,
	data,
	nickname,
	actions,
	...props
}) {
	const t = useTranslation();

	const timeAgo = useTimeAgo();
	const timeShortAgo = useShortTimeAgo();

	return (
		<VerticalBar.ScrollableContent p='x24' {...props}>
			<InfoPanel>
				<InfoPanel.Avatar>
					<Avatar size={'x332'} username={username} etag={data?.avatarETag} />
				</InfoPanel.Avatar>

				{actions && <InfoPanel.Section>{actions}</InfoPanel.Section>}

				<InfoPanel.Section>
					<InfoPanel.Title title={(showRealNames && name) || username || name} icon={status} />

					<InfoPanel.Text>{customStatus}</InfoPanel.Text>
				</InfoPanel.Section>

				<InfoPanel.Section>
					{!!roles && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Roles')}</InfoPanel.Label>
							<UserCard.Roles>{roles}</UserCard.Roles>
						</InfoPanel.Field>
					)}

					{Number.isInteger(utcOffset) && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Local_Time')}</InfoPanel.Label>
							<InfoPanel.Text>
								<UTCClock utcOffset={utcOffset} />
							</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{username && username !== name && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Username')}</InfoPanel.Label>
							<InfoPanel.Text>{username}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					<InfoPanel.Field>
						<InfoPanel.Label>{t('Last_login')}</InfoPanel.Label>
						<InfoPanel.Text>{lastLogin ? timeShortAgo(lastLogin) : t('Never')}</InfoPanel.Text>
					</InfoPanel.Field>

					{name && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Full_Name')}</InfoPanel.Label>
							<InfoPanel.Text>{name}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{nickname && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Nickname')}</InfoPanel.Label>
							<InfoPanel.Text>{nickname}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{bio && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Bio')}</InfoPanel.Label>
							<InfoPanel.Text withTruncatedText={false}>
								<MarkdownText variant='inline' content={bio} />
							</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{phone && (
						<InfoPanel.Field>
							{' '}
							<InfoPanel.Label>{t('Phone')}</InfoPanel.Label>
							<InfoPanel.Text display='flex' flexDirection='row' alignItems='center'>
								<Box is='a' withTruncatedText href={`tel:${phone}`}>
									{phone}
								</Box>
							</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{email && (
						<InfoPanel.Field>
							{' '}
							<InfoPanel.Label>{t('Email')}</InfoPanel.Label>
							<InfoPanel.Text display='flex' flexDirection='row' alignItems='center'>
								<Box is='a' withTruncatedText href={`mailto:${email}`}>
									{email}
								</Box>
								<Margins inline='x4'>
									{verified && <Tag variant='primary'>{t('Verified')}</Tag>}
									{verified || <Tag disabled>{t('Not_verified')}</Tag>}
								</Margins>
							</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{customFields &&
						Object.entries(customFields).map(([label, value]) => (
							<InfoPanel.Field key={label}>
								<InfoPanel.Label>{t(label)}</InfoPanel.Label>
								<InfoPanel.Text>{value}</InfoPanel.Text>
							</InfoPanel.Field>
						))}

					<InfoPanel.Field>
						<InfoPanel.Label>{t('Created_at')}</InfoPanel.Label>
						<InfoPanel.Text>{timeAgo(createdAt)}</InfoPanel.Text>
					</InfoPanel.Field>
				</InfoPanel.Section>
			</InfoPanel>
		</VerticalBar.ScrollableContent>
	);
}

export default memo(UserInfo);
