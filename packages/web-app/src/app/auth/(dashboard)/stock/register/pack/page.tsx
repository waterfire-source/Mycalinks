'use client';

import { PackSelectionStep } from '@/feature/stock/register/pack/components/steps/PackSelectionStep';
import FixedPackRegister from '@/feature/stock/register/pack/components/steps/FixedPackRegister';
import { PackConfirmationStep } from '@/feature/stock/register/pack/components/steps/PackConfirmationStep';
import RandomPackRegister from '@/feature/stock/register/pack/components/steps/RandomPackRegister';
import { usePackRegisterState } from '@/feature/stock/register/pack/hooks/usePackRegisterState';

/**
 * パック開封メインページ
 *
 * - 全状態管理をusePackRegisterStateフックに移譲
 * - 機能別にカスタムフックを分割（選択・開封データ・確認・ナビゲーション）
 */
export default function StockRegisterListPage() {
  // 全ての状態管理とロジックをカスタムフックで管理
  const state = usePackRegisterState();

  // progressに応じて各ステップを表示
  switch (state.progress) {
    case 'select-pack':
      return <PackSelectionStep {...state} />;

    case 'register-fixed-pack':
      if (!state.selectedPack) return null;
      return (
        <FixedPackRegister
          {...state}
          includeRandomPack={state.registerParams.isRandomPack ?? false}
        />
      );

    case 'register-random-pack':
      return (
        <RandomPackRegister
          {...state}
          includeFixedPack={state.registerParams.isFixedPack ?? false}
        />
      );

    case 'confirm':
      return <PackConfirmationStep {...state} />;

    default:
      return null;
  }
}
