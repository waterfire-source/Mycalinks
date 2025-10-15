import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';

// 年齢計算ロジック
const getAgeFromBirthday = (birthday: Date | string): number => {
  const today = new Date();
  const birthDate =
    typeof birthday === 'string' ? new Date(birthday) : birthday;

  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// Customerオブジェクトから誕生日を取得し年齢を計算
export const calculateAge = (
  customer:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0]
    | undefined,
): number | null => {
  if (customer?.birthday) {
    return getAgeFromBirthday(customer.birthday);
  } else {
    return null; // 誕生日がない場合はnullを返す
  }
};
