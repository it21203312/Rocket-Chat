sizeOf = Npm.require 'image-size'
mime = Npm.require 'mime-types'
crypto = Npm.require 'crypto'

mime.extensions['image/vnd.microsoft.icon'] = ['ico']

@RocketChatAssetsInstance = new RocketChatFile.GridFS
	name: 'assets'


assets =
	'logo':
		label: 'logo (svg, png, jpg)'
		defaultUrl: 'images/logo/logo.svg'
		constraints:
			type: 'image'
			extensions: ['svg', 'png', 'jpg', 'jpeg']
			width: undefined
			height: undefined
	'favicon_ico':
		label: 'favicon (ico)'
		defaultUrl: 'favicon.ico'
		constraints:
			type: 'image'
			extensions: ['ico']
			width: undefined
			height: undefined
	'favicon':
		label: 'favicon (svg)'
		defaultUrl: 'images/logo/icon.svg'
		constraints:
			type: 'image'
			extensions: ['svg']
			width: undefined
			height: undefined
	'favicon_16':
		label: 'favicon 16x16 (png)'
		defaultUrl: 'images/logo/favicon-16x16.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 16
			height: 16
	'favicon_32':
		label: 'favicon 32x32 (png)'
		defaultUrl: 'images/logo/favicon-32x32.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 32
			height: 32
	'favicon_192':
		label: 'android-chrome 192x192 (png)'
		defaultUrl: 'images/logo/android-chrome-192x192.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 192
			height: 192
	'favicon_512':
		label: 'android-chrome 512x512 (png)'
		defaultUrl: 'images/logo/512x512.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 512
			height: 512
	'touchicon_180':
		label: 'apple-touch-icon 180x180 (png)'
		defaultUrl: 'images/logo/apple-touch-icon.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 180
			height: 180
	'touchicon_180_pre':
		label: 'apple-touch-icon-precomposed 180x180 (png)'
		defaultUrl: 'images/logo/apple-touch-icon-precomposed.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 180
			height: 180
	'tile_144':
		label: 'mstile 144x144 (png)'
		defaultUrl: 'images/logo/mstile-144x144.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 144
			height: 144
	'tile_150':
		label: 'mstile 150x150 (png)'
		defaultUrl: 'images/logo/mstile-150x150.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 150
			height: 150
	'tile_310_square':
		label: 'mstile 310x310 (png)'
		defaultUrl: 'images/logo/mstile-310x310.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 310
			height: 310
	'tile_310_wide':
		label: 'mstile 310x150 (png)'
		defaultUrl: 'images/logo/mstile-310x150.png'
		constraints:
			type: 'image'
			extensions: ['png']
			width: 310
			height: 150
	'safari_pinned':
		label: 'safari pinneed tab (svg)'
		defaultUrl: 'images/logo/safari-pinned-tab.svg'
		constraints:
			type: 'image'
			extensions: ['svg']
			width: undefined
			height: undefined


RocketChat.Assets = new class
	mime: mime
	assets: assets

	setAsset: (binaryContent, contentType, asset) ->
		if not assets[asset]?
			throw new Meteor.Error "error-invalid-asset", 'Invalid asset', { function: 'RocketChat.Assets.setAsset' }

		extension = mime.extension(contentType)
		if extension not in assets[asset].constraints.extensions
			throw new Meteor.Error contentType, 'Invalid file type: ' + contentType, { function: 'RocketChat.Assets.setAsset', errorTitle: 'error-invalid-file-type' }

		file = new Buffer(binaryContent, 'binary')
		if assets[asset].constraints.width? or assets[asset].constraints.height?
			dimensions = sizeOf file

			if assets[asset].constraints.width? and assets[asset].constraints.width isnt dimensions.width
				throw new Meteor.Error "error-invalid-file-width", "Invalid file width", { function: 'Invalid file width' }

			if assets[asset].constraints.height? and assets[asset].constraints.height isnt dimensions.height
				throw new Meteor.Error "error-invalid-file-height"

		rs = RocketChatFile.bufferToStream file
		RocketChatAssetsInstance.deleteFile asset
		ws = RocketChatAssetsInstance.createWriteStream asset, contentType
		ws.on 'end', Meteor.bindEnvironment ->
			Meteor.setTimeout ->
				key = "Assets_#{asset}"
				value = {
					url: "assets/#{asset}.#{extension}"
					defaultUrl: assets[asset].defaultUrl
				}
				RocketChat.settings.updateById key, value
				RocketChat.Assets.processAsset key, value
			, 200

		rs.pipe ws
		return

	unsetAsset: (asset) ->
		if not assets[asset]?
			throw new Meteor.Error "error-invalid-asset", 'Invalid asset', { function: 'RocketChat.Assets.unsetAsset' }

		RocketChatAssetsInstance.deleteFile asset

		key = "Assets_#{asset}"
		value = {
			defaultUrl: assets[asset].defaultUrl
		}
		RocketChat.settings.updateById key, value
		RocketChat.Assets.processAsset key, value
		return

	refreshClients: ->
		process.emit('message', {refresh: 'client'})

	processAsset: (settingKey, settingValue) ->
		if settingKey.indexOf('Assets_') isnt 0
			return

		assetKey = settingKey.replace /^Assets_/, ''
		assetValue = assets[assetKey]

		if not assetValue?
			return

		if not settingValue?.url?
			assetValue.cache = undefined
			return

		file = RocketChatAssetsInstance.getFileSync assetKey
		if not file
			assetValue.cache = undefined
			return

		hash = crypto.createHash('sha1').update(file.buffer).digest('hex')
		extension = settingValue.url.split('.').pop()
		assetValue.cache =
			path: "assets/#{assetKey}.#{extension}"
			cacheable: false
			sourceMapUrl: undefined
			where: 'client'
			type: 'asset'
			content: file.buffer
			extension: extension
			url: "/assets/#{assetKey}.#{extension}?#{hash}"
			size: file.length
			uploadDate: file.uploadDate
			contentType: file.contentType
			hash: hash


RocketChat.settings.addGroup 'Assets'
RocketChat.settings.add 'Assets_SvgFavicon_Enable', true, { type: 'boolean', group: 'Assets', i18nLabel: 'Enable_Svg_Favicon' }
for key, value of assets
	do (key, value) ->
		RocketChat.settings.add "Assets_#{key}", {defaultUrl: value.defaultUrl}, { type: 'asset', group: 'Assets', fileConstraints: value.constraints, i18nLabel: value.label, asset: key, public: true }


RocketChat.models.Settings.find().observe
	added: (record) ->
		RocketChat.Assets.processAsset record._id, record.value
	changed: (record) ->
		RocketChat.Assets.processAsset record._id, record.value
	removed: (record) ->
		RocketChat.Assets.processAsset record._id, undefined

Meteor.startup ->
	Meteor.setTimeout ->
		process.emit('message', {refresh: 'client'})
	, 200

calculateClientHash = WebAppHashing.calculateClientHash
WebAppHashing.calculateClientHash = (manifest, includeFilter, runtimeConfigOverride) ->
	for key, value of assets
		if not value.cache? && not value.defaultUrl?
			continue

		cache = {}
		if value.cache
			cache =
				path: value.cache.path
				cacheable: value.cache.cacheable
				sourceMapUrl: value.cache.sourceMapUrl
				where: value.cache.where
				type: value.cache.type
				url: value.cache.url
				size: value.cache.size
				hash: value.cache.hash

			WebAppInternals.staticFiles["/__cordova/assets/#{key}"] = value.cache
			WebAppInternals.staticFiles["/__cordova/assets/#{key}.#{value.cache.extension}"] = value.cache
		else
			extension = value.defaultUrl.split('.').pop()
			cache =
				path: "assets/#{key}.#{extension}"
				cacheable: false
				sourceMapUrl: undefined
				where: 'client'
				type: 'asset'
				url: "/assets/#{key}.#{extension}?v3"
				# size: value.cache.size
				hash: 'v3'

			WebAppInternals.staticFiles["/__cordova/assets/#{key}"] = WebAppInternals.staticFiles["/__cordova/#{value.defaultUrl}"]
			WebAppInternals.staticFiles["/__cordova/assets/#{key}.#{extension}"] = WebAppInternals.staticFiles["/__cordova/#{value.defaultUrl}"]

		manifestItem = _.findWhere manifest, {path: key}

		if manifestItem?
			index = manifest.indexOf(manifestItem)

			manifest[index] = cache
		else
			manifest.push cache

	return calculateClientHash.call this, manifest, includeFilter, runtimeConfigOverride


Meteor.methods
	refreshClients: ->
		unless Meteor.userId()
			throw new Meteor.Error 'error-invalid-user', "Invalid user", { method: 'refreshClients' }

		hasPermission = RocketChat.authz.hasPermission Meteor.userId(), 'manage-assets'
		unless hasPermission
			throw new Meteor.Error 'error-action-now-allowed', 'Managing assets not allowed', { method: 'refreshClients', action: 'Managing_assets' }

		RocketChat.Assets.refreshClients()


	unsetAsset: (asset) ->
		unless Meteor.userId()
			throw new Meteor.Error 'error-invalid-user', "Invalid user", { method: 'unsetAsset' }

		hasPermission = RocketChat.authz.hasPermission Meteor.userId(), 'manage-assets'
		unless hasPermission
			throw new Meteor.Error 'error-action-now-allowed', 'Managing assets not allowed', { method: 'unsetAsset', action: 'Managing_assets' }

		RocketChat.Assets.unsetAsset asset


	setAsset: (binaryContent, contentType, asset) ->
		unless Meteor.userId()
			throw new Meteor.Error 'error-invalid-user', "Invalid user", { method: 'setAsset' }

		hasPermission = RocketChat.authz.hasPermission Meteor.userId(), 'manage-assets'
		unless hasPermission
			throw new Meteor.Error 'error-action-now-allowed', 'Managing assets not allowed', { method: 'setAsset', action: 'Managing_assets' }

		RocketChat.Assets.setAsset binaryContent, contentType, asset
		return


WebApp.connectHandlers.use '/assets/', Meteor.bindEnvironment (req, res, next) ->
	params =
		asset: decodeURIComponent(req.url.replace(/^\//, '').replace(/\?.*$/, '')).replace(/\.[^.]*$/, '')

	file = assets[params.asset]?.cache

	if not file?
		if assets[params.asset]?.defaultUrl?
			req.url = '/'+assets[params.asset].defaultUrl
			WebAppInternals.staticFilesMiddleware WebAppInternals.staticFiles, req, res, next
		else
			res.writeHead 404
			res.end()

		return

	reqModifiedHeader = req.headers["if-modified-since"];
	if reqModifiedHeader?
		if reqModifiedHeader == file.uploadDate?.toUTCString()
			res.setHeader 'Last-Modified', reqModifiedHeader
			res.writeHead 304
			res.end()
			return

	res.setHeader 'Cache-Control', 'public, max-age=0'
	res.setHeader 'Expires', '-1'
	res.setHeader 'Last-Modified', file.uploadDate?.toUTCString() or new Date().toUTCString()
	res.setHeader 'Content-Type', file.contentType
	res.setHeader 'Content-Length', file.size

	res.writeHead 200
	res.end(file.content)
	return
