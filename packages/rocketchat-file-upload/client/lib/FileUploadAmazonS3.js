/* globals FileUpload, FileUploadBase, Slingshot */

FileUpload.AmazonS3 = class FileUploadAmazonS3 extends FileUploadBase {
	constructor(directive, meta, file) {
		super(meta, file);
		const directives = {
			'upload': 'rocketchat-uploads',
			'avatar': 'rocketchat-avatars'
		};
		this.directive = directive;
		this.uploader = new Slingshot.Upload(directives[directive], meta);
	}

	start(callback) {
		this.uploader.send(this.file, (error, downloadUrl) => {
			if (this.computation) {
				this.computation.stop();
			}

			if (error) {
				return callback.call(this, error);
			} else {
				const file = _.pick(this.meta, 'type', 'size', 'name', 'identify', 'description');
				file._id = downloadUrl.substr(downloadUrl.lastIndexOf('/') + 1);
				file.url = downloadUrl;

				return callback(null, file, this.directive === 'avatar' ? 'S3:Avatars' : 'S3:Uploads');
			}
		});

		this.computation = Tracker.autorun(() => {
			this.onProgress(this.uploader.progress());
		});
	}

	onProgress() {}

	stop() {
		if (this.uploader && this.uploader.xhr) {
			this.uploader.xhr.abort();
		}
	}
};
