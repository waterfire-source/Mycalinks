import { z } from 'zod';

export const PasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: z
      .string()
      .min(8, '新しいパスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, '新しいパスワードを確認してください'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type PasswordFormType = z.infer<typeof PasswordFormSchema>;
