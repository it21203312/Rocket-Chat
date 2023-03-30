import { Messages, VideoConference, LivechatDepartmentAgents, Rooms, Subscriptions } from '@rocket.chat/models';

import { _setUsername } from './setUsername';
import { _setRealName } from './setRealName';
import { Users } from '../../../models/server';
import { FileUpload } from '../../../file-upload/server';
import { updateGroupDMsName } from './updateGroupDMsName';
import { validateName } from './validateName';

/**
 *
 * @param {object} changes changes to the user
 */

export async function saveUserIdentity({ _id, name: rawName, username: rawUsername }: { _id: string; name?: string; username?: string }) {
	if (!_id) {
		return { success: false, error: 'The required "_id" param is missing.' };
	}

	const name = String(rawName).trim();
	const username = String(rawUsername).trim();

	const user = Users.findOneById(_id);

	const previousUsername = user.username;
	const previousName = user.name;
	const nameChanged = previousName !== name;
	const usernameChanged = previousUsername !== username;

	if (typeof rawUsername !== 'undefined' && usernameChanged) {
		if (!validateName(username)) {
			return { success: false, error: 'Invalid username' };
		}
		const { success, error = null } = await _setUsername(_id, username, user) as any;
		if (!success) {
			return { success, error: error ?? 'Unable to set username' };
		}
		user.username = username;
	}

	if (typeof rawName !== 'undefined' && nameChanged) {
		if (!_setRealName(_id, name, user)) {
			return { success: false, error: 'Unable to set name' };
		}
	}

	// if coming from old username, update all references
	if (previousUsername) {
		if (usernameChanged && typeof rawUsername !== 'undefined') {
			await Messages.updateAllUsernamesByUserId(user._id, username);
			await Messages.updateUsernameOfEditByUserId(user._id, username);

			const cursor = Messages.findByMention(previousUsername);
			for await (const msg of cursor) {
				const updatedMsg = msg.msg.replace(new RegExp(`@${previousUsername}`, 'ig'), `@${username}`);
				await Messages.updateUsernameAndMessageOfMentionByIdAndOldUsername(msg._id, previousUsername, username, updatedMsg);
			}

			await Rooms.replaceUsername(previousUsername, username);
			await Rooms.replaceMutedUsername(previousUsername, username);
			await Rooms.replaceUsernameOfUserByUserId(user._id, username);
			await Subscriptions.setUserUsernameByUserId(user._id, username);

			await LivechatDepartmentAgents.replaceUsernameOfAgentByUserId(user._id, username);

			const fileStore = FileUpload.getStore('Avatars');
			const previousFile = await fileStore.model.findOneByName(previousUsername);
			const file = await fileStore.model.findOneByName(username);
			if (file) {
				fileStore.model.deleteFile(file._id);
			}
			if (previousFile) {
				fileStore.model.updateFileNameById(previousFile._id, username);
			}
		}

		// update other references if either the name or username has changed
		if (usernameChanged || nameChanged) {
			// update name and fname of 1-on-1 direct messages
			await Subscriptions.updateDirectNameAndFnameByName(previousUsername, rawUsername && username, rawName && name);

			// update name and fname of group direct messages
			await updateGroupDMsName(user);

			// update name and username of users on video conferences
			await VideoConference.updateUserReferences(user._id, username || previousUsername, name || previousName);
		}
	}

	return { success: true };
}
