import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { HelpIcon } from '@/components/common/HelpIcon';
import { ModalState, ModalType, ReservationType } from '@/feature/booking';
import { Box, Stack } from '@mui/material';
import { ReservationStatus } from '@prisma/client';

type Props = {
  selectedReservation: ReservationType | null;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  handleOpenReservationStatusModal: () => void;
  handleOpenEditReservationModal: () => void;
};
export const ReservationProductDetailBottom = ({
  selectedReservation,
  setModalState,
  handleOpenReservationStatusModal,
  handleOpenEditReservationModal,
}: Props) => {
  return (
    <>
      {/* 受付前 */}
      {selectedReservation?.status === ReservationStatus.NOT_STARTED && (
        <>
          <Stack gap={1} direction="row">
            <SecondaryButtonWithIcon onClick={handleOpenEditReservationModal}>
              編集・削除
            </SecondaryButtonWithIcon>
            <HelpIcon helpArchivesNumber={2943} />
          </Stack>
          <Stack gap={1} direction="row">
            <Stack direction="row" gap={1}>
              <HelpIcon helpArchivesNumber={2930} />
              <PrimaryButtonWithIcon
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    status: ModalType.ToStart,
                  })
                }
              >
                受付開始
              </PrimaryButtonWithIcon>
            </Stack>
          </Stack>
        </>
      )}

      {/* 受付中 */}
      {selectedReservation?.status === ReservationStatus.OPEN && (
        <>
          <Box flexGrow={1} />

          <PrimaryButtonWithIcon onClick={handleOpenReservationStatusModal}>
            予約状況確認
          </PrimaryButtonWithIcon>
        </>
      )}

      {/* 受付終了 */}
      {selectedReservation?.status === ReservationStatus.CLOSED && (
        <>
          <Stack direction="row" gap={1}>
            <SecondaryButtonWithIcon
              onClick={() =>
                setModalState({
                  isOpen: true,
                  status: ModalType.ToReStart,
                })
              }
            >
              受付再開
            </SecondaryButtonWithIcon>
            <HelpIcon helpArchivesNumber={2930} />
          </Stack>

          <PrimaryButtonWithIcon onClick={handleOpenReservationStatusModal}>
            予約取り消し・商品の受け渡し
          </PrimaryButtonWithIcon>
        </>
      )}
    </>
  );
};
