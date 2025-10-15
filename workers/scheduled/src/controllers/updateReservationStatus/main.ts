import {
  ReservationReceptionProductStatus,
  ReservationStatus,
} from '@prisma/client';
import { TaskCallback, workerDefs } from 'backend-core';

//お知らせのステータス更新
export const updateReservationStatusController: TaskCallback<
  typeof workerDefs.scheduled.kinds.updateReservationStatus.body
> = async (task) => {
  const thisTask = task.body[0].data;
  const isManual = thisTask.store_id || thisTask.reservation_id;

  //対象を取得
  const allReservations = await task.db.reservation.findMany({
    where: {
      status: {
        //今の所受付終了のものだけ
        in: [ReservationStatus.CLOSED],
      },
      id: thisTask.reservation_id,
    },
    include: {
      receptions: true,
    },
  });

  for (const reservation of allReservations) {
    //すべて受取済みだったらステータスを変える

    let newStatus: ReservationStatus | undefined = undefined;

    if (
      reservation.receptions.every(
        (reception) =>
          reception.status === ReservationReceptionProductStatus.RECEIVED ||
          reception.status === ReservationReceptionProductStatus.CANCELLED,
      )
    ) {
      newStatus = ReservationStatus.FINISHED;
    }

    if (newStatus) {
      const updateRes = await task.db.reservation.update({
        where: { id: reservation.id },
        data: { status: newStatus },
      });

      console.log(
        `reservation ${reservation.id} status changed to ${newStatus}`,
      );
    }
  }
};
