import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { useChat } from '../../../../../client/views/room/contexts/ChatContext';
import { useComposerBoxPopupQueries } from './useComposerBoxPopupQueries';

export type MessageBoxOptions<T extends { _id: string }> = {
	title?: string;
	getItemsFromLocal: (filter: string) => Promise<T[]>;
	getItemsFromServer: (filter: string) => Promise<T[]>;
	focused?: T | undefined;
	blurOnSelectItem?: boolean;
	closeOnEsc?: boolean;

	trigger?: string;
	triggerAnywhere?: boolean;

	suffix?: string;
	prefix?: string;

	matchSelectorRegex?: RegExp;

	getValue(item: T): string;

	renderItem?: ({ item }: { item: T }) => ReactElement;
};

type IMessageBoxResult<T> = {
	callbackRef: (node: HTMLElement) => void;
} & (
	| { popup: MessageBoxOptions<T>; items: UseQueryResult<T[]>[]; focused: T | undefined }
	| {
			popup: undefined;
			items: undefined;
			focused: undefined;
	  }
);

const keys = {
	TAB: 9,
	ENTER: 13,
	ESC: 27,
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,
};

export const useComposerBoxPopup = <T extends { _id: string; sort?: number }>({
	configurations,
}: {
	configurations: MessageBoxOptions<T>[];
}): IMessageBoxResult<T> => {
	const [popup, setPopup] = useState<MessageBoxOptions<T> | undefined>(undefined);
	const [focused, setFocused] = useState<T | undefined>(undefined);

	const [filter, setFilter] = useState('');

	const items = useComposerBoxPopupQueries(filter, popup?.getItemsFromLocal, popup?.getItemsFromServer);

	const chat = useChat();

	const select = useMutableCallback((item: T) => {
		if (!popup) {
			throw new Error('No popup is open');
		}

		const value = chat?.composer?.substring(0, chat?.composer?.selection.start);
		const selector =
			popup.matchSelectorRegex ??
			(popup.triggerAnywhere ? new RegExp(`(?:^| |\n)(${popup.trigger})([^\\s]*$)`) : new RegExp(`(?:^)(${popup.trigger})([^\\s]*$)`));

		const result = value?.match(selector);
		if (!result || !value) {
			return;
		}

		chat?.composer?.replaceText((popup.prefix ?? popup.trigger ?? '') + popup.getValue(item) + (popup.suffix ?? ''), {
			start: value.lastIndexOf(result[1] + result[2]),
			end: chat?.composer?.selection.start,
		});

		setPopup(undefined);
		setFocused(undefined);
	});

	const setConfigByInput = useMutableCallback((): MessageBoxOptions<T> | undefined => {
		const value = chat?.composer?.substring(0, chat?.composer?.selection.start);

		if (!value) {
			setPopup(undefined);
			setFocused(undefined);
			return;
		}

		const configuration = configurations.find(({ trigger, matchSelectorRegex, triggerAnywhere }) => {
			const selector =
				matchSelectorRegex ?? (triggerAnywhere ? new RegExp(`(?:^| |\n)(${trigger})[^\\s]*$`) : new RegExp(`(?:^)(${trigger})[^\\s]*$`));
			const result = selector.test(value);
			return result;
		});

		setPopup(configuration);
		if (!configuration) {
			setFocused(undefined);
			setFilter('');
		}
		if (configuration) {
			const selector =
				configuration.matchSelectorRegex ??
				(configuration.triggerAnywhere
					? new RegExp(`(?:^| |\n)(${configuration.trigger})([^\\s]*$)`)
					: new RegExp(`(?:^)(${configuration.trigger})([^\\s]*$)`));
			const result = value.match(selector);
			setFilter(result ? result[2] : '');
		}
		return configuration;
	});

	const onFocus = useMutableCallback(() => {
		if (popup) {
			return;
		}
		setConfigByInput();
	});

	const keyup = useMutableCallback((event: KeyboardEvent) => {
		if (!setConfigByInput()) {
			return;
		}

		if (!popup) {
			return;
		}

		if (popup.closeOnEsc === true && event.which === keys.ESC) {
			setPopup(undefined);
			setFocused(undefined);
			event.preventDefault();
			event.stopPropagation();
		}
	});

	const keydown = useMutableCallback((event: KeyboardEvent) => {
		if (!popup) {
			return;
		}

		if (event.which === keys.ENTER || event.which === keys.TAB) {
			if (!focused) {
				return;
			}

			select(focused);

			event.preventDefault();
			event.stopPropagation();
			return true;
		}
		if (event.which === keys.ARROW_UP && !(event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)) {
			setFocused((focused) => {
				const list = items
					.filter((item) => item.isSuccess)
					.flatMap((item) => item.data)
					.sort((a, b) => ('sort' in a && 'sort' in b ? a.sort - b.sort : 0));

				if (!list) {
					return;
				}

				const focusedIndex = list.findIndex((item) => item === focused);

				return (focusedIndex > -1 ? list[focusedIndex - 1] : list[list.length - 1]) as T;
			});
			event.preventDefault();
			event.stopPropagation();
			return true;
		}
		if (event.which === keys.ARROW_DOWN && !(event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)) {
			setFocused((focused) => {
				const list = items
					.filter((item) => item.isSuccess)
					.flatMap((item) => item.data)
					.sort((a, b) => ('sort' in a && 'sort' in b ? a.sort - b.sort : 0));

				if (!list) {
					return undefined;
				}

				const focusedIndex = list.findIndex((item) => item === focused);

				return (focusedIndex < list.length - 1 ? list[focusedIndex + 1] : list[0]) as T;
			});
			event.preventDefault();
			event.stopPropagation();
			return true;
		}
	});

	const callbackRef = useCallback(
		(node: HTMLElement | null) => {
			if (!node) {
				return;
			}

			node.addEventListener('keyup', keyup);
			node.addEventListener('keydown', keydown);
			node.addEventListener('focus', onFocus);
		},
		[keyup, keydown, onFocus],
	);

	return {
		items,
		popup,
		focused,

		callbackRef,
	};
};
