import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
export const TimeText = () => {
  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setFormattedDate(dayjs().format('YYYY/MM/DD HH:mm:ss'));
    const intervalId = setInterval(() => {
      setFormattedDate(dayjs().format('YYYY/MM/DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return <Typography>{formattedDate}</Typography>;
};
