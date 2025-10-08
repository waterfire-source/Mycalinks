import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { GuestCustomer } from '@/feature/createGuestCustomer';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

export const useCreateGuestCustomer = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const createGuestCustomer = useCallback(
    async (storeId: string | string[], guestCustomer: GuestCustomer) => {
      try {
        // birthdateをDate型に変換
        const birthdate = dayjs(guestCustomer.birthdate, 'YYYYMMDD').toDate();
        //非会員用の仮顧客情報を作成する
        const res = await clientAPI.customer.createGuestCustomer({
          store_id: Number(storeId),
          full_name: guestCustomer.name,
          full_name_ruby: guestCustomer.furigana,
          birthday: birthdate,
          zip_code: guestCustomer.postalCode,
          prefecture: guestCustomer.prefecture,
          city: guestCustomer.city,
          address2: guestCustomer.address,
          building: guestCustomer.buildingName
            ? guestCustomer.buildingName
            : undefined,
          phone_number: guestCustomer.phoneNumber,
          career: guestCustomer.career,
          gender: guestCustomer.gender,
        });

        if (res instanceof CustomError) {
          return;
        }
        return res;
      } catch (e) {
        setAlertState({
          message: '顧客情報を仮登録に失敗しました。',
          severity: 'error',
        });
      }
    },
    [clientAPI.customer, setAlertState],
  );

  return {
    createGuestCustomer,
  };
};
