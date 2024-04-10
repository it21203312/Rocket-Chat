import type { ILivechatVisitor, ILivechatVisitorDTO, Serialized } from '@rocket.chat/core-typings';
import type { ComponentChildren, VNode } from 'preact';
import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import type { CustomField } from '../components/Form/CustomFields';
import type { Agent } from '../definitions/agents';
import type { Department } from '../definitions/departments';
import { parentCall } from '../lib/parentCall';
import { createToken } from '../lib/random';
import Store from './Store';

export type LivechatHiddenSytemMessageType =
	| 'uj' // User joined
	| 'ul' // User left
	| 'livechat-close' // Chat closed
	| 'livechat-started' // Chat started
	| 'livechat_transfer_history'; // Chat transfered

export type StoreState = {
	token: string;
	typing: string[];
	config: {
		loading: boolean;
		messages: {
			offlineMessage?: string;
			offlineSuccessMessage?: string;
			offlineUnavailableMessage?: string;
			conversationFinishedMessage?: string;
			conversationFinishedText?: string;
			transcriptMessage?: string;
			registrationFormMessage?: string;
			dataProcessingConsentText?: string;
			switchDepartmentMessage?: string;
		};
		theme: {
			title?: string;
			color?: string;
			offlineTitle?: string;
			offlineColor?: string;
			position: 'left' | 'right';
			background?: string;
			actionLinks?: {
				webrtc: {
					actionLinksAlignment: string;
					i18nLabel: string;
					label: string;
					method_id: string;
				}[];
				jitsi: {
					icon: string;
					i18nLabel: string;
				}[];
			};
		};
		triggers: any[];
		resources: any;
		settings: {
			registrationForm?: boolean;
			nameFieldRegistrationForm?: boolean;
			emailFieldRegistrationForm?: boolean;
			forceAcceptDataProcessingConsent?: boolean;
			fileUpload?: any;
			allowSwitchingDepartments?: any;
			showConnecting?: any;
			limitTextLength?: any;
			displayOfflineForm?: boolean;
			hiddenSystemMessages?: LivechatHiddenSytemMessageType[];
			hideWatermark?: boolean;
			livechatLogo?: { url: string };
		};
		online?: boolean;
		departments: Department[];
		customFields?: CustomField[];
		enabled?: boolean;
	};
	messages: any[];
	user?: Serialized<ILivechatVisitor>;
	guest?: Serialized<ILivechatVisitorDTO>;
	sound: {
		src?: string;
		play?: boolean;
		enabled: boolean;
	};
	iframe: {
		guest: Partial<Serialized<ILivechatVisitorDTO>>;
		guestMetadata?: Record<string, string>;
		theme: {
			title?: string;
			color?: string;
			fontColor?: string;
			iconColor?: string;
			offlineTitle?: string;
			position?: 'left' | 'right';
			guestBubbleBackgroundColor?: string;
			agentBubbleBackgroundColor?: string;
			background?: string;
			hideGuestAvatar?: boolean;
			hideAgentAvatar?: boolean;
		};
		visible?: boolean;
		department?: string;
		language?: string;
		defaultDepartment?: string;
		hiddenSystemMessages?: LivechatHiddenSytemMessageType[];
	};
	gdpr: {
		accepted: boolean;
	};
	alerts: any[];
	visible: boolean;
	minimized: boolean;
	unread: any;
	incomingCallAlert: any;
	ongoingCall: any;
	businessUnit: any;
	openSessionIds?: string[];
	triggered?: boolean;
	undocked?: boolean;
	expanded?: boolean;
	modal?: VNode | null;
	agent?: any;
	room?: { _id: string };
	noMoreMessages?: boolean;
	loading?: boolean;
	department?: string;
	lastReadMessageId?: any;
	triggerAgent?: any;
	queueInfo?: any;
	defaultAgent?: Agent;
	parentUrl?: string;
	connecting?: boolean;
	messageListPosition?: 'top' | 'bottom' | 'free';
};

export const initialState = (): StoreState => ({
	token: createToken(),
	typing: [],
	config: {
		loading: true,
		messages: {},
		settings: {},
		theme: {
			position: 'right',
		},
		triggers: [],
		departments: [],
		resources: {},
	},
	messages: [],
	user: undefined,
	sound: {
		src: '',
		enabled: true,
		play: false,
	},
	iframe: {
		guest: {},
		theme: {
			hideGuestAvatar: true,
			hideAgentAvatar: false,
		},
		visible: true,
	},
	gdpr: {
		accepted: false,
	},
	alerts: [],
	visible: true,
	minimized: true,
	unread: null,
	incomingCallAlert: null,
	ongoingCall: null, // TODO: store call info like url, startTime, timeout, etc here
	businessUnit: null,
});

const dontPersist = [
	'messages',
	'typing',
	'loading',
	'alerts',
	'unread',
	'noMoreMessages',
	'modal',
	'incomingCallAlert',
	'ongoingCall',
	'parentUrl',
];

export const store = new Store(initialState(), { dontPersist });

const { sessionStorage } = window;

window.addEventListener('load', () => {
	const sessionId = createToken();
	sessionStorage.setItem('sessionId', sessionId);
	const { openSessionIds = [] } = store.state;
	store.setState({ openSessionIds: [sessionId, ...openSessionIds] });
});

window.addEventListener('visibilitychange', () => {
	!store.state.minimized && !store.state.triggered && parentCall('openWidget');
	store.state.iframe.visible ? parentCall('showWidget') : parentCall('hideWidget');
});

window.addEventListener('beforeunload', () => {
	const sessionId = sessionStorage.getItem('sessionId');
	const { openSessionIds = [] } = store.state;
	store.setState({ openSessionIds: openSessionIds.filter((session) => session !== sessionId) });
});

if (process.env.NODE_ENV === 'development') {
	store.on('change', ([, , partialState]) => {
		console.log('%cstore.setState %c%o', 'color: blue', 'color: initial', partialState);
	});
}

export type Dispatch = typeof store.setState;

type StoreContextValue = StoreState & {
	dispatch: Dispatch;
	on: typeof store.on;
	off: typeof store.off;
};

export const StoreContext = createContext<StoreContextValue>({
	...store.state,
	dispatch: store.setState.bind(store),
	on: store.on.bind(store),
	off: store.off.bind(store),
});

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [state, setState] = useState({
		...store.state,
		dispatch: store.setState.bind(store),
		on: store.on.bind(store),
		off: store.off.bind(store),
	});

	useEffect(() => {
		const handleStoreChange = () => {
			setState((old) => ({ ...old, ...store.state }));
		};
		store.on('change', handleStoreChange);
		return () => {
			store.off('change', handleStoreChange);
		};
	}, []);

	return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>;
};

export const { Consumer } = StoreContext;

export default store;

export const useStore = (): StoreContextValue => {
	const store = useContext(StoreContext);

	return store;
};
