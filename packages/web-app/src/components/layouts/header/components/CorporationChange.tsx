import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Account, Corporation } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { signIn, useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { PosRunMode } from '@/types/next-auth';

export const CorporationChange = () => {
  const { data: session } = useSession();

  //神アカウント限定で、法人リストを取得しておく
  const [corporations, setCorporations] = useState<
    {
      id: Corporation['id'];
      name: Corporation['name'];
      account_email: Account['email'];
      account_display_name: Account['display_name'];
    }[]
  >([]);
  const masterPassword = useRef<string | null>(null);

  const fetchAllCorporations = useCallback(async () => {
    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });

    const response = await apiClient.corporation.getAllCorporation();

    masterPassword.current = response.masterPassword;

    setCorporations(response.corporations);
  }, []);

  useEffect(() => {
    if (session?.user?.isGod) {
      fetchAllCorporations();
    }
  }, [session]);

  const handleSelectCorporation = useCallback(
    async (event: SelectChangeEvent<number>) => {
      const selectedCorporationId = event.target.value as number;

      //この法人の情報を取得する
      const thisCorporationInfo = corporations.find(
        (c) => c.id === selectedCorporationId,
      );

      if (!thisCorporationInfo) {
        return;
      }

      //一旦ログアウトして、すぐにログインする
      await signOut({
        redirect: false,
      });

      await signIn('credentials', {
        email: thisCorporationInfo.account_email,
        password: masterPassword.current,
        mode: PosRunMode.admin,
      });
    },
    [corporations],
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography>法人：</Typography>
      <Select
        value={session?.user?.corporation_id ?? 0}
        onChange={handleSelectCorporation}
        sx={{ minWidth: 120, minHeight: '33px', height: '33px' }}
      >
        {corporations.map((c) => (
          <MenuItem key={c.id} value={c.id} title={c.account_email}>
            {c.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
