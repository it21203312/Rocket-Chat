orig_updateOrCreateUserFromExternalService = Accounts.updateOrCreateUserFromExternalService
Accounts.updateOrCreateUserFromExternalService = (serviceName, serviceData, options) ->
	if serviceName not in ['facebook', 'github', 'google', 'meteor-developer']
		return

	if serviceName is 'github' and (not serviceData.email? or serviceData.email.trim() is '')
		throw new Meteor.Error 'github-no-public-email'

	if serviceName is 'meteor-developer'
		if _.isArray serviceData?.emails
			serviceData.emails.sort (a, b) ->
				return a.primary isnt true

			for email in serviceData.emails
				if email.verified is true
					serviceData.email = email.address
					break

	if not serviceData.email? or serviceData.email.trim() is ''
		throw new Meteor.Error 'no-verified-email'
		return

	# Remove not verified users that have same email
	notVerifiedUser = Meteor.users.remove({emails: {$elemMatch: {address: serviceData.email, verified: false}}})

	# Try to get existent user with same email verified
	user = Meteor.users.findOne({emails: {$elemMatch: {address: serviceData.email, verified: true}}})

	if user?
		serviceIdKey = "services." + serviceName + ".id"
		update = {}
		update[serviceIdKey] = serviceData.id
		Meteor.users.update({
			_id: user._id
		}, {
			$set: update
		})

	return orig_updateOrCreateUserFromExternalService.apply(this, arguments)
