
RocketChat.Migrations.add({
	version: 133,
	up() {
		const rename = (oldId, newId) => {
			const accountsSetting = RocketChat.models.Settings.findOne();
			delete accountsSetting._id;
			delete accountsSetting.enableQuery;
			delete accountsSetting.i18nDefaultQuery;

			RocketChat.models.Settings.upsert({ _id: newId }, accountsSetting);
			RocketChat.models.Settings.removeById(oldId);

		};

		rename('Accounts_UserAddedEmail', 'Accounts_UserAddedEmail_Email');
		rename('Accounts_UserAddedEmailSubject', 'Accounts_UserAddedEmail_Subject');
		rename('Invitation_HTML', 'Invitation_Email');

		const updateIfDefault = (customized, idEmail, idSubject) => {
			const setting = RocketChat.models.Settings.findOne({ _id: customized });
			const newSettingEmail = RocketChat.models.Settings.findOne({ _id: idEmail });
			const newSettingSubject = RocketChat.models.Settings.findOne({ _id: idSubject });

			delete newSettingSubject._id;
			delete newSettingSubject.enableQuery;
			delete newSettingSubject.i18nDefaultQuery;


			delete newSettingEmail._id;
			delete newSettingEmail.enableQuery;
			delete newSettingEmail.i18nDefaultQuery;
			if (setting && setting.value === false) {
				newSettingEmail.value = newSettingEmail.packageValue;
				newSettingSubject.value = newSettingSubject.packageValue;
			}

			RocketChat.models.Settings.upsert({ _id: idEmail }, newSettingEmail);
			RocketChat.models.Settings.upsert({ _id: idSubject }, newSettingSubject);
			RocketChat.models.Settings.remove({ _id: customized });
		};

		updateIfDefault('Accounts_Enrollment_Customized', 'Accounts_Enrollment_Email', 'Accounts_Enrollment_Email_Subject');
		updateIfDefault('Accounts_UserAddedEmail_Customized', 'Accounts_UserAddedEmail_Email', 'Accounts_UserAddedEmail_Subject');
		updateIfDefault('Forgot_Password_Customized', 'Forgot_Password_Email', 'Forgot_Password_Email_Subject');
		updateIfDefault('Verification_Customized', 'Verification_Email', 'Verification_Email_Subject');
		updateIfDefault('Invitation_Customized', 'Invitation_Email', 'Invitation_Subject');

		Object.entries({
			Email_Header: '<html><table border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#f3f3f3" style="color:#4a4a4a;font-family: Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;border-collapse:collapse;border-spacing:0;margin:0 auto"><tr><td style="padding:1em"><table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="width:100%;margin:0 auto;max-width:800px"><tr><td bgcolor="#ffffff" style="background-color:#ffffff; border: 1px solid #DDD; font-size: 10pt; font-family: Helvetica,Arial,sans-serif;"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #04436a;"><h1 style="font-family: Helvetica,Arial,sans-serif; padding: 0 1em; margin: 0; line-height: 70px; color: #FFF;">[Site_Name]</h1></td></tr><tr><td style="padding: 1em; font-size: 10pt; font-family: Helvetica,Arial,sans-serif;">',
			Email_Footer: '</td></tr></table></td></tr><tr><td border="0" cellspacing="0" cellpadding="0" width="100%" style="font-family: Helvetica,Arial,sans-serif; max-width: 800px; margin: 0 auto; padding: 1.5em; text-align: center; font-size: 8pt; color: #999;">Powered by <a href="https://rocket.chat" target="_blank">Rocket.Chat</a></td></tr></table></td></tr></table></html>',
			Email_Footer_Direct_Reply: '</td></tr></table></td></tr><tr><td border="0" cellspacing="0" cellpadding="0" width="100%" style="font-family: Helvetica,Arial,sans-serif; max-width: 800px; margin: 0 auto; padding: 1.5em; text-align: center; font-size: 8pt; color: #999;">You can directly reply to this email.<br>Do not modify previous emails in the thread.<br>Powered by <a href="https://rocket.chat" target="_blank">Rocket.Chat</a></td></tr></table></td></tr></table></html>',
		}).forEach(([_id, oldValue]) => {
			const setting = RocketChat.models.Settings.findOne({ _id });
			if (setting.value === oldValue) {
				RocketChat.models.Settings.updateValueById(_id, setting.packageValue);
			}

		});

	},
});
