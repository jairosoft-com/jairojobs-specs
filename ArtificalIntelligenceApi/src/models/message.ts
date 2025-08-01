/**
 * Artifical Intelligence APILib
 *
 * This file was automatically generated by APIMATIC v3.0 ( https://www.apimatic.io ).
 */

import { object, optional, Schema } from '../schema';
import {
  MessageContent,
  messageContentSchema,
} from './containers/messageContent';
import { RoleEnum, roleEnumSchema } from './roleEnum';

export interface Message {
  /** The role of the message. */
  role?: RoleEnum;
  content?: MessageContent;
}

export const messageSchema: Schema<Message> = object({
  role: ['role', optional(roleEnumSchema)],
  content: ['content', optional(messageContentSchema)],
});
