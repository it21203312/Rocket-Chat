import { registerModel } from '@rocket.chat/models';

import { trashCollection } from '../database/trash';
import { db, prefix } from '../database/utils';
import { InvitesRaw } from './raw/Invites';

const col = db.collection(`${prefix}invites`);
registerModel('IInvitesModel', new InvitesRaw(col, trashCollection));
