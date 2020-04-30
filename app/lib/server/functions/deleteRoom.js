import { Messages, Subscriptions, Rooms } from '../../../models';
import { callbacks } from '../../../callbacks';
import { FileUpload } from '../../../file-upload/server';

export const deleteRoom = function(rid) {
	const room = Rooms.findOneById(rid);
	FileUpload.removeFilesByRoomId(rid);
	Messages.removeByRoomId(rid);
	callbacks.run('beforeDeleteRoom', rid);
	Subscriptions.removeByRoomId(rid);
	// removes room's avatar
	if (room.avatarOrigin === 'upload' || room.avatarOrigin === 'url') {
		FileUpload.getStore('Avatars').deleteByName(room._id);
	}
	callbacks.run('afterDeleteRoom', rid);
	return Rooms.removeById(rid);
};
