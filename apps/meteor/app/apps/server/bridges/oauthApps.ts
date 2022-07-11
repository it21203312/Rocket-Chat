import { IOAuthApp, IOAuthAppParams } from '@rocket.chat/apps-engine/definition/accessors/IOAuthApps';
import { OAuthAppsBridge } from '@rocket.chat/apps-engine/server/bridges/OAuthAppsBridge';
import { IOAuthApps } from '@rocket.chat/core-typings';
import { OAuthApps, Users } from '@rocket.chat/models';
import { Random } from 'meteor/random';
import { v4 as uuidv4 } from 'uuid';

import { AppServerOrchestrator } from '../orchestrator';

export class AppOAuthAppsBridge extends OAuthAppsBridge {
	constructor(private readonly orch: AppServerOrchestrator) {
		super();
	}

	protected async create(OAuthApp: IOAuthAppParams, appId: string): Promise<string | null> {
		this.orch.debugLog(`The App ${appId} is creating a new OAuth app.`);
		const { clientId, clientSecret } = OAuthApp;
		const botUser = await Users.findOne({ appId });
		if (!botUser) {
			this.orch.debugLog('Unable to find the bot`s user');
			return null;
		}

		const { _id, username } = botUser;

		return (
			await OAuthApps.insertOne({
				...OAuthApp,
				_id: uuidv4(),
				appId,
				clientId: clientId ?? Random.id(),
				clientSecret: clientSecret ?? Random.secret(),
				_createdAt: new Date(),
				_createdBy: {
					_id,
					username,
				},
			} as unknown as IOAuthApps)
		).insertedId;
	}

	protected async getById(id: string, appId: string): Promise<IOAuthApp | null> {
		this.orch.debugLog(`The App ${appId} is getting the OAuth app by ID ${id}.`);
		const data = await OAuthApps.findOne({ _id: id, appId });
		if (data) {
			const { _id, _createdAt, _createdBy, _updatedAt } = data as any;
			return {
				...data,
				id: _id,
				createdAt: _createdAt.toDateString(),
				createdBy: {
					id: _createdBy._id,
					username: _createdBy.username,
				},
				updatedAt: _updatedAt,
			};
		}

		return null;
	}

	protected async getByName(name: string, appId: string): Promise<Array<IOAuthApp>> {
		this.orch.debugLog(`The App ${appId} is getting the OAuth apps by name.`);
		return OAuthApps.find({ name, appId }).toArray() as unknown as Array<IOAuthApp>;
	}

	protected async update(OAuthApp: IOAuthAppParams, id: string, appId: string): Promise<void> {
		this.orch.debugLog(`The App ${appId} is updating the OAuth app ${id}.`);
		await OAuthApps.updateOne({ _id: id, appId }, { $set: OAuthApp }, { upsert: true });
	}

	protected async delete(id: string, appId: string): Promise<void> {
		this.orch.debugLog(`The App ${appId} is deleting the OAuth app ${id}.`);
		await OAuthApps.deleteOne({ _id: id, appId });
	}

	protected async purge(appId: string): Promise<void> {
		this.orch.debugLog(`The App ${appId} is deleting an OAuth app.`);
		await OAuthApps.deleteMany({ appId });
	}
}
