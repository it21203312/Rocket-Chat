import { Table } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { GenericTableRow } from './GenericTableRow';

export const GenericTableHeader: FC = ({ children }) => (
	<Table.Head>
		<GenericTableRow>{children}</GenericTableRow>
	</Table.Head>
);
