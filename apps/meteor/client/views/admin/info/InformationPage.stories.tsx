import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import InformationPage from './InformationPage';

export default {
	title: 'Admin/Info/InformationPage',
	component: InformationPage,
	parameters: {
		layout: 'fullscreen',
		serverContext: {
			baseURL: 'http://localhost:3000',
			callEndpoint: {
				'GET /v1/licenses.get': async () => ({
					licenses: [
						{
							url: 'https://example.com/license.txt',
							expiry: '2020-01-01T00:00:00.000Z',
							maxActiveUsers: 100,
							modules: ['auditing'],
							maxGuestUsers: 100,
							maxRoomsPerGuest: 100,
						},
					],
				}),
				'GET /v1/licenses.maxActiveUsers': async () => ({
					maxActiveUsers: 123,
					activeUsers: 32,
				}),
			},
			callMethod: {
				'license:getTags': async () => [{ name: 'Example plan', color: 'red' }],
			},
		},
	},
	decorators: [(fn) => <div style={{ display: 'flex', height: '100vh' }}>{fn()}</div>],
	argTypes: {
		onClickDownloadInfo: { action: 'onClickDownloadInfo' },
		onClickRefreshButton: { action: 'onClickRefreshButton' },
	},
	args: {
		canViewStatistics: true,
		info: {
			build: {
				arch: 'x64',
				cpus: 1,
				platform: 'linux',
				osRelease: 'Ubuntu 18.04.1 LTS',
				date: '2020-01-01T00:00:00.000Z',
				freeMemory: 1.3 * 1024 * 1024 * 1024,
				nodeVersion: 'v12.0.0',
				totalMemory: 2.4 * 1024 * 1024 * 1024,
			},
			version: '1.0.0',
			marketplaceApiVersion: '1.0.0',
			commit: {
				author: 'John Doe',
				date: '2020-01-01T00:00:00.000Z',
				branch: 'master',
				hash: '1234567890',
				subject: 'This is a commit',
				tag: 'v1.0.0',
			},
		},
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
			deploymentFingerprintHash: '',
			deploymentFingerprintVerified: true,
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
			totalLivechatManagers: 10,
			totalCustomFields: 10,
			totalTriggers: 1,
			isDepartmentRemovalEnabled: false,
			archivedDepartments: 0,
			totalLivechatVisitors: 0,
			totalLivechatAgents: 0,
			livechatEnabled: false,
			federatedServers: 0,
			federatedUsers: 0,
			lastLogin: '',
			lastMessageSentAt: new Date(),
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
			msEnabled: false,
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
			webRTCEnabled: false,
			webRTCEnabledForOmnichannel: false,
			omnichannelWebRTCCalls: 1,
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
			omnichannelContactsBySource: { contactsCount: 0, conversationsCount: 0, sources: [] },
			uniqueContactsOfLastMonth: { contactsCount: 0, conversationsCount: 0, sources: [] },
			uniqueContactsOfLastWeek: { contactsCount: 0, conversationsCount: 0, sources: [] },
			uniqueContactsOfYesterday: { contactsCount: 0, conversationsCount: 0, sources: [] },
			apps: {
				engineVersion: 'x.y.z',
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
			homeTitleChanged: false,
			homeBodyChanged: false,
			customCSSChanged: false,
			onLogoutCustomScriptChanged: false,
			loggedOutCustomScriptChanged: false,
			loggedInCustomScriptChanged: false,
			logoChange: false,
			customCSS: 0,
			customScript: 0,
			tabInvites: 0,
			totalEmailInvitation: 0,
			totalRoomsWithStarred: 0,
			totalRoomsWithPinned: 0,
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
			totalBroadcastRooms: 0,
			totalRoomsWithActiveLivestream: 0,
			totalTriggeredEmails: 0,
			totalLinkInvitation: 0,
			roomsInsideTeams: 0,
			totalEncryptedMessages: 0,
			totalLinkInvitationUses: 0,
			totalManuallyAddedUsers: 0,
			videoConf: {
				videoConference: {
					started: 0,
					ended: 0,
				},
				direct: {
					calling: 0,
					started: 0,
					ended: 0,
				},
				livechat: {
					started: 0,
					ended: 0,
				},
				settings: {
					provider: '',
					dms: false,
					channels: false,
					groups: false,
					teams: false,
				},
			},
			totalSubscriptionRoles: 0,
			totalUserRoles: 0,
			totalCustomRoles: 0,
			totalWebRTCCalls: 0,
			uncaughtExceptionsCount: 0,
			push: 0,
			matrixFederation: {
				enabled: false,
			},
		},
		instances: [],
	},
} as ComponentMeta<typeof InformationPage>;

const Template: ComponentStory<typeof InformationPage> = (args) => <InformationPage {...args} />;

export const Default = Template.bind({});
Default.storyName = 'InformationPage';
