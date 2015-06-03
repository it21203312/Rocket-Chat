Template.usernamePrompt.onCreated ->
	self = this
	self.username = new ReactiveVar

	Meteor.call 'getUsernameSuggestion', (error, username) ->
		self.username.set
			ready: true
			username: username
		Meteor.defer ->
			self.find('input').focus()

Template.usernamePrompt.helpers
	username: ->
		return Template.instance().username.get()

Template.usernamePrompt.events
	'submit #login-card': (event, instance) ->
		event.preventDefault()

		username = instance.username.get()
		username.empty = false
		username.error = false
		username.invalid = false
		instance.username.set(username)

		button = $(event.target).find('button.login')
		Rocket.Button.loading(button)

		value = $("input").val().trim()
		if value is ''
			username.empty = true
			instance.username.set(username)
			Rocket.Button.reset(button)
			return

		Meteor.call 'setUsername', value, (err, result) ->
			if err?
				if err.error is 'username-invalid'
					username.invalid = true
				else
					username.error = true
				username.username = value
			Rocket.Button.reset(button)
			instance.username.set(username)
