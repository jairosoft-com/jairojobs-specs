/**
 * Artifical Intelligence APILib
 *
 * This file was automatically generated by APIMATIC v3.0 ( https://www.apimatic.io ).
 */

import {
  array,
  boolean,
  lazy,
  number,
  object,
  optional,
  Schema,
  string,
} from '../schema';
import {
  CreateMessageRequestSystem,
  createMessageRequestSystemSchema,
} from './containers/createMessageRequestSystem';
import {
  CreateMessageRequestToolChoice,
  createMessageRequestToolChoiceSchema,
} from './containers/createMessageRequestToolChoice';
import { Message, messageSchema } from './message';
import { Metadata, metadataSchema } from './metadata';
import { Tool, toolSchema } from './tool';

export interface CreateMessageRequest {
  /** The model that will complete your prompt. */
  model: string;
  messages: Message[];
  /** The maximum number of tokens to generate before stopping. */
  maxTokens: number;
  /** An object describing metadata about the request. */
  metadata?: Metadata;
  /**
   * Custom text sequences that will cause the model to stop generating.
   *  Our models will normally stop when they have naturally completed their turn, which will result in a response stop_reason of `end_turn`.
   *  If you want the model to stop generating when it encounters custom strings of text, you can use the stop_sequences parameter. If the model encounters one of the custom sequences, the response stop_reason value will be `stop_sequence` and the response stop_sequence value will contain the matched stop sequence.
   */
  stopSequence?: string[];
  /** Whether to incrementally stream the response using server-sent events. */
  stream?: boolean;
  system?: CreateMessageRequestSystem;
  /**
   * Amount of randomness injected into the response.
   *  Defaults to 1.0. Ranges from 0.0 to 1.0. Use temperature closer to 0.0 for analytical / multiple choice, and closer to 1.0 for creative and generative tasks.
   *  Note that even with temperature of 0.0, the results will not be fully deterministic
   */
  temperature?: number;
  /** How the model should use the provided tools. The model can use a specific tool, any available tool, or decide by itself. */
  toolChoice?: CreateMessageRequestToolChoice;
  tools?: Tool[];
  /**
   * Only sample from the top K options for each subsequent token.
   *  Used to remove `long tail` low probability responses. Learn more technical details here.
   *  Recommended for advanced use cases only. You usually only need to use temperature.
   */
  topK?: number;
  /**
   * Use nucleus sampling.
   *  In nucleus sampling, we compute the cumulative distribution over all the options for each subsequent token in decreasing probability order and cut it off once it reaches a particular probability specified by top_p. You should either alter temperature or top_p, but not both.
   *  Recommended for advanced use cases only. You usually only need to use temperature
   */
  topP?: number;
}

export const createMessageRequestSchema: Schema<CreateMessageRequest> = object({
  model: ['model', string()],
  messages: ['messages', array(lazy(() => messageSchema))],
  maxTokens: ['max_tokens', number()],
  metadata: ['metadata', optional(lazy(() => metadataSchema))],
  stopSequence: ['stop_sequence', optional(array(string()))],
  stream: ['stream', optional(boolean())],
  system: ['system', optional(createMessageRequestSystemSchema)],
  temperature: ['temperature', optional(number())],
  toolChoice: ['tool_choice', optional(createMessageRequestToolChoiceSchema)],
  tools: ['tools', optional(array(lazy(() => toolSchema)))],
  topK: ['top_k', optional(number())],
  topP: ['top_p', optional(number())],
});
