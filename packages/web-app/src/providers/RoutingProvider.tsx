import { useRouter } from 'next/navigation';
import { policies, PolicyKind } from '@/constants/policies';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { ERROR_PATH } from '@/constants/paths';
export const RoutingProvider = ({ children }: { children: ReactNode }) => {
  const { accountGroup } = useAccountGroupContext();
  const router = useRouter();
  const pathname = usePathname();
  if (accountGroup === null || accountGroup === undefined) {
    return <></>;
  }
  // ページの閲覧権限の場合、現在のパスと設定されたパスが一致するかを検証し、一致しない場合はエラーページにリダイレクト
  const isValidate = () => {
    return Object.values(policies).every((policy) => {
      // ポリシーがページの閲覧権限じゃなければスキップ
      if (policy.kind !== PolicyKind.PAGE_READ) {
        return true;
      }
      // ポリシーが現在のパスと一致しない場合スキップ
      if (pathname !== policy.path) {
        return true;
      }
      // 権限グループに無い場合はfalse
      return accountGroup[policy.key];
    });
  };
  if (!isValidate()) {
    router.push(ERROR_PATH.unauthorized);
  }
  return <>{children}</>;
};
