import { DeckAvailableProductsPriorityOption } from '@/app/ec/(core)/hooks/useEcDeck';
import { FieldNameMap } from '@/contexts/FormErrorContext';
import { z } from 'zod';
export type DeckOptionFieldName =
  | 'anyCardNumber'
  | 'anyRarity'
  | 'conditionOption'
  | 'priorityOption';

export const DECK_OPTION_NAME_MAP: FieldNameMap = {
  anyCardNumber: '型番',
  anyRarity: 'レアリティ',
  conditionOption: '状態(複数選択可)',
  priorityOption: 'その他',
};

export const DeckOptionForm = z.object({
  anyCardNumber: z.boolean(),
  anyRarity: z.boolean(),
  conditionOption: z.array(z.string()).min(1, {
    message: '状態を選択してください。',
  }),
  priorityOption: z.nativeEnum(DeckAvailableProductsPriorityOption),
});

export type DeckOptionFormType = z.infer<typeof DeckOptionForm>;
