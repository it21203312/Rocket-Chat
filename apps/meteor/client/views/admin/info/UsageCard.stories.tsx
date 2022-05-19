import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import UsageCard from './UsageCard';

export default {
	title: 'Admin/Info/UsageCard',
	component: UsageCard,
	parameters: {
		layout: 'centered',
	},
	args: {
		statistics: {
			// Users
			totalUsers: 123,
			onlineUsers: 23,
			awayUsers: 32,
			busyUsers: 21,
			offlineUsers: 123 - 23 - 32 - 21,
			// Types and Distribution
			totalConnectedUsers: 32,
			activeUsers: 12,
			activeGuests: 32 - 12,
			nonActiveUsers: 0,
			appUsers: 23,
			// Uploads
			uploadsTotal: 321,
			uploadsTotalSize: 123 * 1024 * 1024,
			// Rooms
			totalRooms: 231,
			totalChannels: 12,
			totalPrivateGroups: 23,
			totalDirect: 21,
			totalDiscussions: 32,
			totalLivechat: 31,
			// Messages
			totalMessages: 321,
			totalThreads: 123,
			totalChannelMessages: 213,
			totalPrivateGroupMessages: 21,
			totalDirectMessages: 23,
			totalLivechatMessages: 31,
			// -
			_id: '',
			wizard: {},
			uniqueId: '',
			installedAt: '',
			version: '',
			tag: '',
			branch: '',
			userLanguages: {},
			teams: {
				totalTeams: 0,
				totalRoomsInsideTeams: 0,
				totalDefaultRoomsInsideTeams: 0,
			},
			totalLivechatVisitors: 0,
			totalLivechatAgents: 0,
			livechatEnabled: false,
			federatedServers: 0,
			federatedUsers: 0,
			lastLogin: '',
			lastMessageSentAt: '',
			lastSeenSubscription: '',
			os: {
				type: '',
				platform: 'linux',
				arch: '',
				release: '',
				uptime: 0,
				loadavg: [0, 0, 0],
				totalmem: 0,
				freemem: 0,
				cpus: [
					{
						model: '',
						speed: 0,
						times: {
							user: 0,
							nice: 0,
							sys: 0,
							idle: 0,
							irq: 0,
						},
					},
				],
			},
			process: {
				nodeVersion: '',
				pid: 0,
				uptime: 0,
			},
			deploy: {
				method: '',
				platform: '',
			},
			enterpriseReady: false,
			migration: {
				_id: '',
				locked: false,
				version: 0,
				buildAt: '',
				lockedAt: '',
			},
			instanceCount: 0,
			oplogEnabled: false,
			mongoVersion: '',
			mongoStorageEngine: '',
			pushQueue: 0,
			omnichannelSources: [{}],
			departments: 0,
			routingAlgorithm: '',
			onHoldEnabled: false,
			emailInboxes: 0,
			BusinessHours: {},
			lastChattedAgentPreferred: false,
			assignNewConversationsToContactManager: false,
			visitorAbandonment: '',
			chatsOnHold: 0,
			voipEnabled: false,
			voipCalls: 0,
			voipExtensions: 0,
			voipSuccessfulCalls: 0,
			voipErrorCalls: 0,
			voipOnHoldCalls: 0,
			federationOverviewData: {
				numberOfEvents: 0,
				numberOfFederatedUsers: 0,
				numberOfServers: 0,
			},
			readReceiptsEnabled: false,
			readReceiptsDetailed: false,
			uniqueUsersOfLastWeek: { data: [], day: 0, month: 0, year: 0 },
			uniqueUsersOfLastMonth: { data: [], day: 0, month: 0, year: 0 },
			uniqueUsersOfYesterday: { data: [], day: 0, month: 0, year: 0 },
			uniqueDevicesOfYesterday: { data: [], day: 0, month: 0, year: 0 },
			uniqueDevicesOfLastWeek: { data: [], day: 0, month: 0, year: 0 },
			uniqueDevicesOfLastMonth: { data: [], day: 0, month: 0, year: 0 },
			uniqueOSOfYesterday: { data: [], day: 0, month: 0, year: 0 },
			uniqueOSOfLastWeek: { data: [], day: 0, month: 0, year: 0 },
			uniqueOSOfLastMonth: { data: [], day: 0, month: 0, year: 0 },
			apps: {
				engineVersion: 0,
				enabled: false,
				totalInstalled: 0,
				totalActive: 0,
				totalFailed: 0,
			},
			services: {},
			importer: {},
			settings: {},
			integrations: {
				totalIntegrations: 0,
				totalIncoming: 0,
				totalIncomingActive: 0,
				totalOutgoing: 0,
				totalOutgoingActive: 0,
				totalWithScriptEnabled: 0,
			},
			enterprise: {
				modules: [],
				tags: [],
				seatRequests: 0,
				livechatTags: 0,
				cannedResponses: 0,
				priorities: 0,
				businessUnits: 0,
			},
			createdAt: new Date(),
			showHomeButton: false,
			homeTitle: '',
			homeBody: '',
			logoChange: false,
			customCSS: 0,
			customScript: 0,
			tabInvites: 0,
			totalEmailInvitation: 0,
			totalRoomsWithSnippet: 0,
			totalRoomsWithStarred: 0,
			totalRoomsWithPinned: 0,
			totalSnippet: 0,
			totalStarred: 0,
			totalPinned: 0,
			totalE2ERooms: 0,
			totalE2EMessages: 0,
			totalUserTOTP: 0,
			totalUserEmail2fa: 0,
			usersCreatedADM: 0,
			usersCreatedSlackImport: 0,
			usersCreatedSlackUser: 0,
			usersCreatedCSVImport: 0,
			usersCreatedHiptext: 0,
			totalOTR: 0,
			totalOTRRooms: 0,
			slashCommandsJitsi: 0,
			messageAuditApply: 0,
			messageAuditLoad: 0,
			dashboardCount: 0,
			joinJitsiButton: 0,
			totalLinkInvitation: 0,
			roomsWithPinnedMessages: 0,
			roomsWithStarredMessages: 0,
			customCSSLines: 0,
			customScriptLines: 0,
			roomsInsideTeams: 0,
			totalEncryptedMessages: 0,
			totalLinkInvitationUses: 0,
			totalManuallyAddedUsers: 0,
		},
	},
} as ComponentMeta<typeof UsageCard>;

const Template: ComponentStory<typeof UsageCard> = (args) => <UsageCard {...args} />;

export const Example = Template.bind({});

export const Vertical = Template.bind({});
Vertical.args = {
	vertical: true,
};
