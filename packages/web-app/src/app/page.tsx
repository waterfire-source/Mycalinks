import Link from 'next/link';
import styles from '@/app/page.module.css';
import { Button } from '@mui/material';
import { PATH } from '@/constants/paths';

export default function Home() {
  return (
    <main className={styles.main}>
      <Link href={PATH.DASHBOARD}>
        <Button>ダッシュボード</Button>
      </Link>
      <Link href={PATH.LOGIN}>
        <Button>ログイン</Button>
      </Link>
    </main>
  );
}
