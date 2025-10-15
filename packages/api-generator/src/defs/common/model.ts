import { AccountSchema } from 'backend-core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const StaffAccountComponent = z.object({
  id: AccountSchema.shape.id,
  display_name: AccountSchema.shape.display_name,
});

/**
 * 住所
 */
export const AddressComponent = z.object({
  zipCode: z.string(),
  prefecture: z.string(),
  city: z.string(),
  address2: z.string(),
  building: z.string(),
  fullName: z.string(),
  fullNameRuby: z.string(),
  phoneNumber: z.string(),
});
