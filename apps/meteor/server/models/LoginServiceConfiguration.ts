import { registerModel } from '@rocket.chat/models';

import { trashCollection } from '../database/trash';
import { db } from '../database/utils';
import { LoginServiceConfigurationRaw } from './raw/LoginServiceConfiguration';

const col = db.collection('meteor_accounts_loginServiceConfiguration');
export const LoginServiceConfiguration = new LoginServiceConfigurationRaw(col, trashCollection, { preventSetUpdatedAt: true });
registerModel('ILoginServiceConfigurationModel', LoginServiceConfiguration);
