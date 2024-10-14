import type { IHttp, IModify, IPersistence, IRead } from '../accessors';
import type { IMessageStarContext } from './IMessageStarContext';

/**
 * Handler for after a message has been starred or unstarred
 */
export interface IPostMessageStarred {
    /**
     * Method called *after* the message has been starred or unstarred.
     *
     * @param context The context
     * @param read An accessor to the environment
     * @param http An accessor to the outside world
     * @param persistence An accessor to the App's persistence
     * @param modify An accessor to the modifier
     */
    executePostMessageStarred(context: IMessageStarContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void>;
}
