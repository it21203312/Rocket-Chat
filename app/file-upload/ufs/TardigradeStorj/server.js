// import stream from 'stream';

import { UploadFS } from 'meteor/jalik:ufs';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import _ from 'underscore';
import storj from 'uplink-nodejs';

// TODO: Do this part
/**
 * TardigradeStorj store
 * @param options
 * @constructor
 */
export class TardigradeStorjStore extends UploadFS.Store {
	constructor(options) {
		// Default options
		// options.secretAccessKey,
		// options.accessKeyId,
		// options.region,
		// options.sslEnabled // optional

		options = _.extend({
			httpOptions: {
				timeout: 6000,
				agent: false,
			},
		}, options);

		super(options);

		// const classOptions = options;

		const libUplink = new storj.Uplink();

		options.getPath = options.getPath || function(file) {
			return file._id;
		};

		this.getPath = function(file) {
			if (file.TardigradeStorj) {
				return file.TardigradeStorj.path;
			}
			// Compatibility
			// TODO: Migration
			// if (file.s3) {
			// 	return file.s3.path + file._id;
			// }
		};

		// this.getRedirectURL = function(file, forceDownload = false, callback) {
		// 	const params = {
		// 		Key: this.getPath(file),
		// 		Expires: classOptions.URLExpiryTimeSpan,
		// 		ResponseContentDisposition: `${ forceDownload ? 'attachment' : 'inline' }; filename="${ encodeURI(file.name) }"`,
		// 	};

		// 	return s3.getSignedUrl('getObject', params, callback);
		// };

		/**
		 * Creates the file in the collection
		 * @param file
		 * @param callback
		 * @return {string}
		 */
		this.create = function(file, callback) {
			check(file, Object);

			if (file._id == null) {
				file._id = Random.id();
			}

			file.TardigradeStorj = {
				path: this.options.getPath(file),
			};

			file.store = this.options.name; // assign store to file
			return this.getCollection().insert(file, callback);
		};

		/**
		 * Removes the file
		 * @param fileId
		 * @param callback
		 */
		this.delete = async function(fileId, callback) {
			const file = this.getCollection().findOne({ _id: fileId });
			const params = {
				Key: this.getPath(file),
			};

			// argument: bucketName and objectName
			await libUplink.deleteObject(params).then((err, data) => {
				if (err) {
					console.error(err);
				}

				callback && callback(err, data);
			});
		};


		/**
		 * Returns the file read stream
		 * @param fileId
		 * @param file
		 * @param options
		 * @return {*}
		 */
		this.getReadStream = function(fileId, file, options = {}) {
			const params = {
				Key: this.getPath(file),
			};

			if (options.start && options.end) {
				params.Range = `${ options.start } - ${ options.end }`;
			}

			// TODO: Not sure
			return libUplink.read(params).createReadStream();
		};


		// TODO: not sure for this
		// /**
		//  * Returns the file write stream
		//  * @param fileId
		//  * @param file
		//  * @param options
		//  * @return {*}
		//  */
		// this.getWriteStream = function(fileId, file/* , options*/) {
		// 	const writeStream = new stream.PassThrough();
		// 	writeStream.length = file.size;

		// 	writeStream.on('newListener', (event, listener) => {
		// 		if (event === 'finish') {
		// 			process.nextTick(() => {
		// 				writeStream.removeListener(event, listener);
		// 				writeStream.on('real_finish', listener);
		// 			});
		// 		}
		// 	});

		// 	libUplink.uploadObject({
		// 		Key: this.getPath(file),
		// 		Body: writeStream,
		// 		ContentType: file.type,

		// 	}, (error) => {
		// 		if (error) {
		// 			console.error(error);
		// 		}

		// 		writeStream.emit('real_finish');
		// 	});

		// 	return writeStream;
		// };
	}
}

// Add store to UFS namespace
UploadFS.store.TardigradeStorj = TardigradeStorjStore;
