import type { IUser, UserReport } from '@rocket.chat/core-typings';
import React from 'react';

import { GenericTableCell, GenericTableRow } from '../../../../components/GenericTable';
import { useFormatDateAndTime } from '../../../../hooks/useFormatDateAndTime';
import UserColumn from '../helpers/UserColumn';
import ModConsoleUserActions from './ModConsoleUserActions';

export type ModConsoleUserRowProps = {
	report: Pick<UserReport, '_id' | 'reportedUser' | 'ts'> & { count: number };
	onClick: (id: IUser['_id']) => void;
	isDesktopOrLarger: boolean;
	avatarUpdateKey?: number;
};

const ModConsoleUserTableRow = ({ report, onClick, isDesktopOrLarger, avatarUpdateKey }: ModConsoleUserRowProps): JSX.Element => {
	const { reportedUser } = report;
	const { _id, username, name, createdAt, emails } = reportedUser;
	const { count, ts } = report;

	const formatDateAndTime = useFormatDateAndTime();

	return (
		<GenericTableRow key={_id} onClick={(): void => onClick(_id)} tabIndex={0} role='link' action>
			<GenericTableCell withTruncatedText>
				<UserColumn key={avatarUpdateKey} name={name} username={username} isDesktopOrLarger={isDesktopOrLarger} />
			</GenericTableCell>
			<GenericTableCell withTruncatedText>{formatDateAndTime(createdAt)}</GenericTableCell>
			<GenericTableCell withTruncatedText>{emails?.[0].address}</GenericTableCell>
			<GenericTableCell withTruncatedText>{formatDateAndTime(ts)}</GenericTableCell>
			<GenericTableCell withTruncatedText>{count}</GenericTableCell>
			<GenericTableCell onClick={(e): void => e.stopPropagation()}>
				<ModConsoleUserActions report={report} onClick={onClick} />
			</GenericTableCell>
		</GenericTableRow>
	);
};

export default ModConsoleUserTableRow;
