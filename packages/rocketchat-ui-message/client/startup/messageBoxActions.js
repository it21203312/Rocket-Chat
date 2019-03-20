import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import mime from 'mime-type/with-db';
import { VRecDialog } from 'meteor/rocketchat:ui-vrecord';
import { messageBox, modal } from 'meteor/rocketchat:ui-utils';
import { fileUpload } from 'meteor/rocketchat:ui';
import { settings } from 'meteor/rocketchat:settings';
import { t } from 'meteor/rocketchat:utils';

messageBox.actions.add('Create_new', 'Video_message', {
	id: 'video-message',
	icon: 'video',
	condition: () => (navigator.mediaDevices || navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia) &&
		window.MediaRecorder &&
		settings.get('FileUpload_Enabled') &&
		settings.get('Message_VideoRecorderEnabled') &&
		(!settings.get('FileUpload_MediaTypeWhiteList') ||
			settings.get('FileUpload_MediaTypeWhiteList').match(/video\/webm|video\/\*/i)),
	action: ({ messageBox }) => (VRecDialog.opened ? VRecDialog.close() : VRecDialog.open(messageBox)),
});

messageBox.actions.add('Add_files_from', 'Computer', {
	id: 'file-upload',
	icon: 'computer',
	condition: () => settings.get('FileUpload_Enabled'),
	action({ event }) {
		event.preventDefault();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
		});

		$(document.body).append($input);

		let isInReplyView = false;
		if (Template.instance()) {
			isInReplyView = $(Template.instance().data.activeElement).parents('.contextual-bar').length > 0;
		}

		$input.one('change', function (e) {
			const filesToUpload = [...e.target.files].map((file) => {
				Object.defineProperty(file, 'type', {
					value: mime.lookup(file.name),
				});
				return {
					file,
					name: file.name,
				};
			});

			fileUpload(filesToUpload, null, isInReplyView);

			$input.remove();
		});

		$input.click();

		// Simple hack for cordova aka codegueira
		if ((typeof device !== 'undefined' && device.platform && device.platform.toLocaleLowerCase() === 'ios') || navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
});

messageBox.actions.add('Add', 'Prescription', {
	id: 'prescription-upload',
	icon: 'cube',
	condition: () => settings.get('FileUpload_Enabled'),
	action({ event }) {
		event.preventDefault();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
		});

		$(document.body).append($input);

		let isInReplyView = false;
		if (Template.instance()) {
			isInReplyView = $(Template.instance().data.activeElement).parents('.contextual-bar').length > 0;
		}
		$input.one('change', function(e) {
			const filesToUpload = [...e.target.files].map((file) => {
				Object.defineProperty(file, 'type', {
					value: mime.lookup(file.name),
				});
				return {
					file,
					name: file.name,
				};
			});
			
			prescriptionUpload(filesToUpload, isInReplyView);

			$input.remove();
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
});

const geolocation = new ReactiveVar(false);

messageBox.actions.add('Share', 'My_location', {
	id: 'share-location',
	icon: 'map-pin',
	condition: () => geolocation.get() !== false,
	action({ rid }) {
		const position = geolocation.get();
		const { latitude, longitude } = position.coords;
		const text = `<div class="upload-preview"><div class="upload-preview-file" style="background-size: cover; box-shadow: 0 0 0px 1px #dfdfdf; border-radius: 2px; height: 250px; width:100%; max-width: 500px; background-image:url(https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=500x250&markers=color:gray%7Clabel:%7C${ latitude },${ longitude }&key=${ settings.get('MapView_GMapsAPIKey') })" ></div></div>`;

		modal.open({
			title: t('Share_Location_Title'),
			text,
			showCancelButton: true,
			closeOnConfirm: true,
			closeOnCancel: true,
			html: true,
		}, function(isConfirm) {
			if (isConfirm !== true) {
				return;
			}
			Meteor.call('sendMessage', {
				_id: Random.id(),
				rid,
				msg: '',
				location: {
					type: 'Point',
					coordinates: [longitude, latitude],
				},
			});
		});
	},
});

Meteor.startup(() => {
	const handleGeolocation = (position) => geolocation.set(position);
	const handleGeolocationError = () => geolocation.set(false);

	Tracker.autorun(() => {
		const isMapViewEnabled = settings.get('MapView_Enabled') === true;
		const isGeolocationWatchSupported = navigator.geolocation && navigator.geolocation.watchPosition;
		const googleMapsApiKey = settings.get('MapView_GMapsAPIKey');
		const canGetGeolocation =
			isMapViewEnabled && isGeolocationWatchSupported && (googleMapsApiKey && googleMapsApiKey.length);

		if (!canGetGeolocation) {
			geolocation.set(false);
			return;
		}

		navigator.geolocation.watchPosition(handleGeolocation, handleGeolocationError, {
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 10000,
		});
	});
});
