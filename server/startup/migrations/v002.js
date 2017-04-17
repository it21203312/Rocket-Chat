/* globals getAvatarSuggestionForUser */

RocketChat.Migrations.add({
	version: 2,
	up() {
		return RocketChat.models.Users.find({
			avatarOrigin: {
				$exists: false
			},
			username: {
				$exists: true
			}
		}).forEach((user) => {
			const avatars = getAvatarSuggestionForUser(user);
			const services = Object.keys(avatars);

			if (services.length === 0) {
				return;
			}

			const service = services[0];

			console.log(user.username, '->', service);

			const dataURI = avatars[service].blob;
			const {image, contentType} = RocketChatFile.dataURIParse(dataURI);

			const rs = RocketChatFile.bufferToStream(new Buffer(image, 'base64'));
			const ws = RocketChatFileAvatarInstance.createWriteStream(`${ user.username }.jpg`, contentType);

			ws.on('end', Meteor.bindEnvironment(function() {
				return RocketChat.models.Users.setAvatarOrigin(user._id, service);
			}));

			return rs.pipe(ws);
		});
	}
});
