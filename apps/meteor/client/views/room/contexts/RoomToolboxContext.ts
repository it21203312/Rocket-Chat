import type { IRoom } from '@rocket.chat/core-typings';
import type { Box, Option } from '@rocket.chat/fuselage';
import type { Keys as IconName } from '@rocket.chat/icons';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { createContext, useContext } from 'react';
import type { ReactNode, MouseEvent, ComponentProps, ComponentType } from 'react';

type ActionRendererProps = Omit<ToolboxActionConfig, 'renderAction' | 'groups' | 'title'> & {
	className: ComponentProps<typeof Box>['className'];
	index: number;
	title: string;
};

type OptionRendererProps = ComponentProps<typeof Option>;

export type OptionRenderer = (props: OptionRendererProps) => ReactNode;

export type ToolboxActionConfig = {
	id: string;
	icon?: IconName;
	title: TranslationKey;
	anonymous?: boolean;
	tooltip?: string;
	disabled?: boolean;
	renderAction?: (props: ActionRendererProps) => ReactNode;
	full?: true;
	renderOption?: OptionRenderer;
	order?: number;
	groups: Array<'group' | 'channel' | 'live' | 'direct' | 'direct_multiple' | 'team' | 'voip'>;
	hotkey?: string;
	action?: (e?: MouseEvent<HTMLElement>) => void;
	template?: ComponentType<{
		_id: IRoom['_id'];
		rid: IRoom['_id'];
		teamId: IRoom['teamId'];
	}>;
	featured?: boolean;
};

export type RoomToolboxContextValue = {
	actions: ToolboxActionConfig[];
	tab?: ToolboxActionConfig;
	context?: string;
	open: (actionId: string, context?: string) => void;
	openRoomInfo: (username?: string) => void;
	close: () => void;
};

export const RoomToolboxContext = createContext<RoomToolboxContextValue>({
	actions: [],
	open: () => undefined,
	openRoomInfo: () => undefined,
	close: () => undefined,
});

export const useRoomToolbox = () => useContext(RoomToolboxContext);

export const useTabBarOpen = (): ((actionId: string, context?: string) => void) => useContext(RoomToolboxContext).open;
export const useTabBarClose = (): (() => void) => useContext(RoomToolboxContext).close;
export const useTabBarOpenUserInfo = (): ((username: string) => void) => useContext(RoomToolboxContext).openRoomInfo;
