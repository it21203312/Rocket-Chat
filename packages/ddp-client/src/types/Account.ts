import { Emitter } from '@rocket.chat/emitter';

import type { ClientStream } from '../ClientStream';

export interface Account
	extends Emitter<{
		uid: string | undefined;
		user: Record<string, unknown> | undefined;
	}> {
	uid?: string;
	user?: Record<string, unknown>;
	loginWithPassword(username: string, password: string): Promise<void>;
	loginWithToken(token: string): Promise<void>;
	logout(): Promise<void>;
}

export class AccountImpl
	extends Emitter<{
		uid: string | undefined;
		user: Record<string, unknown> | undefined;
	}>
	implements Account
{
	uid?: string;

	user?: Record<string, unknown>;

	constructor(private readonly client: ClientStream) {
		super();
		this.client.on('connected', () => {
			if (this.uid) {
				this.loginWithToken(this.uid);
			}
		});

		client.onCollection('users', (data) => {
			if (data.collection !== 'users') {
				return;
			}

			if (!('fields' in data) || !('username' in data.fields!)) {
				return;
			}

			this.user = {
				...this.user,
				_id: data.id,
				username: data.fields.username,
			};
			this.emit('user', this.user);
		});
	}

	async loginWithPassword(username: string, password: string): Promise<void> {
		const { uid } = await this.client.callAsync('login', {
			user: { username },
			password: { digest: password, algorithm: 'sha-256' },
		});
		this.uid = uid;
		this.emit('uid', this.uid);
	}

	async loginWithToken(token: string): Promise<void> {
		const { uid } = await this.client.callAsync('login', {
			resume: token,
		});
		this.uid = uid;
		this.emit('uid', this.uid);
	}

	async logout(): Promise<void> {
		await this.client.callAsync('logout');
		this.uid = undefined;
		this.emit('uid', this.uid);
	}
}
