import Webdav from 'webdav';
import Future from 'fibers/future';

Meteor.methods({
	getWebdavFileList(accountId, path) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid User', {method: 'addNewWebdavAccount'});
		}

		if (!RocketChat.settings.get('Webdav_Integration_Allowed')) {
			throw new Meteor.Error('error-not-allowed', 'WebDAV Integration Not Allowed', {method: 'addNewWebdavAccount'});
		}

		const account = RocketChat.models.WebdavAccounts.findOne({ _id: accountId });
		if (!account) {
			throw new Meteor.Error('error-invalid-webdav-account', 'Invalid WebDAV Account', {method: 'addNewWebdavAccount'});
		}

		const client = new Webdav(
			account.server_url,
			account.username,
			account.password
		);
		const future = new Future();
		client.getDirectoryContents(path).then((data) => {
			future['return']({success: true, data});
		}, (err) => {
			future['return']({success: false, message: 'could-not-access-webdav', error:err});
		});
		return future.wait();
	}
});
