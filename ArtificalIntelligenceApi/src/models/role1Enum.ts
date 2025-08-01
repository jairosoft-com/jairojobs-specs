/**
 * Artifical Intelligence APILib
 *
 * This file was automatically generated by APIMATIC v3.0 ( https://www.apimatic.io ).
 */

import { Schema, stringEnum } from '../schema';

/**
 * Enum for Role1Enum
 */
export enum Role1Enum {
  Assistant = 'assistant',
}

/**
 * Schema for Role1Enum
 */
export const role1EnumSchema: Schema<Role1Enum> = stringEnum(Role1Enum);
