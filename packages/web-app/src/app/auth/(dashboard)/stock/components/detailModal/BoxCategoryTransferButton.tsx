import { BoxToPackDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/BoxToPackDialog';
import { PackToBoxDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/PackToBoxDialog';
import { BoxToCartonDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/BoxToCartonDialog';
import { CartonToBoxDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/CartonToBoxDialog';
import { ConversionTargetTypeDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/ConversionTargetTypeDialog';
import { ConversionDirectionDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/ConversionDirectionDialog';
import { ConversionItemSelectionDialog } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferDialogs/ConversionItemSelectionDialog';
import {
  useCheckBoxInfo,
  AvailableAction,
} from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';
import SecondaryButton from '@/components/buttons/SecondaryButton';

import { Stack } from '@mui/material';
import { useState } from 'react';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

type Props = {
  detailData: BackendProductAPI[0]['response']['200']['products'];
  fetchProducts: () => Promise<void>;
};

type DialogState =
  | undefined
  | 'target-type-select' // 1層目
  | 'direction-select' // 2層目
  | 'item-select' // 3層目
  | 'BOX_TO_PACK' // 4層目
  | 'PACK_TO_BOX'
  | 'BOX_TO_CARTON'
  | 'CARTON_TO_BOX';

export const BoxCategoryTransferButton = ({
  detailData,
  fetchProducts,
}: Props) => {
  const { availableActions: actions, productType } = useCheckBoxInfo({
    itemId: detailData[0]?.item_id,
    enabled: !!detailData[0]?.item_id,
  });

  const [whichDialogIsOpen, setWhichDialogIsOpen] =
    useState<DialogState>(undefined);
  const [selectedTargetType, setSelectedTargetType] = useState<string>();
  const [selectedDirection, setSelectedDirection] = useState<string>();
  const [selectedAction, setSelectedAction] = useState<AvailableAction>();
  const close = () => {
    setWhichDialogIsOpen(undefined);
  };

  // 変換可能な対象を取得する関数（現在のproductTypeは除外）
  const getAvailableTargets = () => {
    //管理番号、特殊状態、委託者商品の場合は表示しない。
    if (
      detailData[0].specialty_id ||
      detailData[0].management_number !== null ||
      detailData[0].consignment_client_id
    ) {
      return [];
    }

    const targets = new Set<string>();
    actions.forEach((action) => {
      if (action.type.includes('TO_PACK')) targets.add('PACK');
      if (action.type.includes('TO_BOX')) targets.add('BOX');
      if (action.type.includes('TO_CARTON')) targets.add('CARTON');
    });

    // 現在のproductTypeと同じものは変換先から除外
    targets.delete(productType);

    return Array.from(targets);
  };

  const availableTargets = getAvailableTargets();

  // 1層目: 変換先タイプ選択ハンドラー
  const handleTargetTypeSelect = (targetType: string) => {
    setSelectedTargetType(targetType);

    // そのターゲットに関連するアクションを取得
    const relevantActions = actions.filter((action) => {
      if (targetType === 'PACK') return action.type.includes('PACK');
      if (targetType === 'BOX') return action.type.includes('BOX');
      if (targetType === 'CARTON') return action.type.includes('CARTON');
      return false;
    });

    if (relevantActions.length === 1) {
      // 単一アクションの場合は3層目へ
      handleDirectionSelect(relevantActions[0].type);
    } else {
      // 複数アクションの場合は2層目へ
      setWhichDialogIsOpen('direction-select');
    }
  };

  // 2層目: 変換方向選択ハンドラー
  const handleDirectionSelect = (direction: string) => {
    setSelectedDirection(direction);

    // 選択された方向のアクションをすべて取得（filterを使用）
    const relevantActions = actions.filter((a) => a.type === direction);

    if (relevantActions.length === 0) return;

    // 変換方向でスキップ条件を判定
    const isSourceToTarget = direction.startsWith(productType + '_TO_');

    if (isSourceToTarget) {
      // 自身→ターゲットの場合、アクションは必ず1つなので3層目スキップ
      setSelectedAction(relevantActions[0]);
      setWhichDialogIsOpen(direction as DialogState);
    } else {
      // ターゲット→自身の場合、複数アクションの可能性あり
      if (relevantActions.length > 1) {
        // 複数アクションがある場合は3層目へ
        setWhichDialogIsOpen('item-select');
      } else {
        // 単一アクションの場合は直接4層目へ
        setSelectedAction(relevantActions[0]);
        setWhichDialogIsOpen(direction as DialogState);
      }
    }
  };

  // 3層目: アクション選択ハンドラー
  const handleActionSelect = (action: AvailableAction) => {
    setSelectedAction(action);
    if (selectedDirection) {
      setWhichDialogIsOpen(selectedDirection as DialogState);
    }
  };

  // メインボタンクリックハンドラー
  const onClickButton = () => {
    if (availableTargets.length > 1) {
      // 複数変換先がある場合は1層目へ
      setWhichDialogIsOpen('target-type-select');
    } else if (availableTargets.length === 1) {
      // 単一変換先の場合は2層目へ
      handleTargetTypeSelect(availableTargets[0]);
    }
  };

  const getButtonText = () => {
    if (availableTargets.length > 1) {
      return 'ボックスを操作する';
    }
    if (availableTargets.length === 0) {
      return 'ボックスを操作する';
    }
    if (productType === 'LOADING') {
      return '読み込み中...';
    }

    // 単一の変換対象の場合のボタンテキスト
    const target = availableTargets[0];
    switch (productType) {
      case 'PACK':
        return target === 'BOX' ? 'パック⇔ボックス' : 'パックを操作する';
      case 'BOX':
        if (target === 'PACK') return 'ボックス⇔パック';
        if (target === 'CARTON') return 'ボックス⇔カートン';
        return 'ボックスを操作する';
      case 'CARTON':
        return target === 'BOX' ? 'カートン⇔ボックス' : 'カートンを操作する';
      default:
        return 'ボックスを操作する';
    }
  };

  const onSuccess = () => {
    fetchProducts();
    close();
  };

  const buttonText = getButtonText();

  return (
    <>
      {actions.length > 0 && (
        <>
          <Stack direction="row" spacing={1}>
            {availableTargets.length > 1 ? (
              <SecondaryButton onClick={onClickButton}>
                {buttonText}
              </SecondaryButton>
            ) : (
              availableTargets.map((target) => {
                const getTargetButtonText = (t: string) => {
                  switch (productType) {
                    case 'PACK':
                      return t === 'BOX' ? 'パック⇔ボックス' : `パック⇔${t}`;
                    case 'BOX':
                      if (t === 'PACK') return 'ボックス⇔パック';
                      if (t === 'CARTON') return 'ボックス⇔カートン';
                      return `ボックス⇔${t}`;
                    case 'CARTON':
                      return t === 'BOX'
                        ? 'カートン⇔ボックス'
                        : `カートン⇔${t}`;
                    default:
                      return `⇔${t}`;
                  }
                };

                return (
                  <SecondaryButton
                    key={target}
                    onClick={() => handleTargetTypeSelect(target)}
                  >
                    {getTargetButtonText(target)}
                  </SecondaryButton>
                );
              })
            )}
          </Stack>

          {/* 1層目: 変換先タイプ選択ダイアログ */}
          <ConversionTargetTypeDialog
            open={whichDialogIsOpen === 'target-type-select'}
            onClose={close}
            availableTargets={availableTargets}
            onTargetSelect={handleTargetTypeSelect}
          />

          {/* 2層目: 変換方向選択ダイアログ */}
          <ConversionDirectionDialog
            open={whichDialogIsOpen === 'direction-select'}
            onClose={close}
            productType={productType}
            targetType={selectedTargetType || ''}
            availableActions={actions}
            onDirectionSelect={handleDirectionSelect}
          />

          {/* 3層目: アクション選択ダイアログ */}
          <ConversionItemSelectionDialog
            open={whichDialogIsOpen === 'item-select'}
            onClose={close}
            actionType={selectedDirection || ''}
            availableActions={actions.filter(
              (a) => a.type === selectedDirection,
            )}
            onActionSelect={handleActionSelect}
          />

          {/* 4層目: パック -> ボックス */}
          {selectedAction && whichDialogIsOpen === 'PACK_TO_BOX' && (
            <PackToBoxDialog
              open={whichDialogIsOpen === 'PACK_TO_BOX'}
              onClose={close}
              sourceInfo={selectedAction.sourceInfo}
              targetInfo={selectedAction.targetInfo}
              detailData={detailData[0]}
              onSuccess={onSuccess}
              productType={productType}
            />
          )}

          {/* 4層目: ボックス -> パック */}
          {selectedAction && whichDialogIsOpen === 'BOX_TO_PACK' && (
            <BoxToPackDialog
              open={whichDialogIsOpen === 'BOX_TO_PACK'}
              onClose={close}
              sourceInfo={selectedAction.sourceInfo}
              targetInfo={selectedAction.targetInfo}
              detailData={detailData[0] || undefined}
              onSuccess={onSuccess}
              productType={productType}
            />
          )}

          {/* 4層目: カートン -> ボックス */}
          {selectedAction && whichDialogIsOpen === 'CARTON_TO_BOX' && (
            <CartonToBoxDialog
              open={whichDialogIsOpen === 'CARTON_TO_BOX'}
              onClose={close}
              sourceInfo={selectedAction.sourceInfo}
              targetInfo={selectedAction.targetInfo}
              detailData={detailData[0] || undefined}
              onSuccess={onSuccess}
              productType={productType}
            />
          )}

          {/* 4層目: ボックス -> カートン */}
          {selectedAction && whichDialogIsOpen === 'BOX_TO_CARTON' && (
            <BoxToCartonDialog
              open={whichDialogIsOpen === 'BOX_TO_CARTON'}
              onClose={close}
              sourceInfo={selectedAction.sourceInfo}
              targetInfo={selectedAction.targetInfo}
              detailData={detailData[0]}
              onSuccess={onSuccess}
              productType={productType}
            />
          )}
        </>
      )}
    </>
  );
};
