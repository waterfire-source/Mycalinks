import { FieldNameMap } from '@/contexts/FormErrorContext';
import { z } from 'zod';
export type AccountFormFieldName =
  | 'displayName'
  | 'email'
  | 'currentPassword'
  | 'storeIds'
  | 'groupId'
  | 'nickName';

export const ACCOUNT_FIELD_NAME_MAP: FieldNameMap = {
  displayName: '名前',
  email: 'メールアドレス',
  currentPassword: 'パスワード',
  storeIds: '所属店舗',
  groupId: '権限',
  nickName: '表示名',
};

export const AccountFormObject = z.object({
  displayName: z.string().min(1, { message: '名前を入力してください。' }),
  currentPassword: z.string().nullable(),
  email: z
    .string()
    .email({ message: 'メールアドレスの形式が正しくありません' }),
  storeIds: z
    .array(z.number())
    .min(1, { message: '所属店舗を選択してください。' }),
  groupId: z.number().min(1, { message: '権限を割り当ててください' }),
  nickName: z.string().optional(),
});

export type AccountFormSchema = z.infer<typeof AccountFormObject>;
