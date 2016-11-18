Package.describe({
	name: 'voismart:ngpresence',
	version: '0.0.1',
	summary: 'Orchestra NG presence integration',
	git: ''
});

Package.onUse(function(api) {
	api.versionsFrom('1.0');

	api.use([
		'coffeescript',
		'tracker',
		'jzwzz:amqplib',
		'jparker:crypto-core',
		'rocketchat:lib',
		'voismart:ngapi'
	]);

	api.addFiles([
		'server.coffee',
		'settings.coffee'
	], ['server']);

	api.addFiles([
		'client.coffee'
	], ['client']);

});

Npm.depends({
	"node-thrift-amqp": "git+https://github.com/VoiSmart/node-thrift-amqp.git#v0.2.1",
	"node-ydin-presence-service": "git+https://github.com/VoiSmart/node-ydin-presence-service.git#2.4.6-1.20161104svnr414"
});
