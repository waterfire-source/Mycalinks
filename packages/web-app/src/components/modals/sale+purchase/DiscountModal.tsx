import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (discount: number, mode: '%' | '円') => void;
}

const DiscountModal: React.FC<Props> = ({
  title,
  open,
  onClose,
  onConfirm,
}) => {
  const [mode, setMode] = useState<'%' | '円'>('%');
  const [customPercentageDiscount, setCustomPercentageDiscount] = useState('');
  const [customAmountDiscount, setCustomAmountDiscount] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('');

  const handleModeChange = (newMode: '%' | '円') => {
    setMode(newMode);
    setSelectedDiscount('');
  };

  const handleDiscountClick = (discount: string) => {
    setSelectedDiscount(discount);
    if (discount === 'custom') {
      setCustomPercentageDiscount('');
      setCustomAmountDiscount('');
    }
  };

  const handleCustomDiscountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (mode === '%') {
      setCustomPercentageDiscount(event.target.value);
    } else {
      setCustomAmountDiscount(event.target.value);
    }
  };

  const handleConfirmClick = () => {
    const discountStr =
      mode === '円'
        ? customAmountDiscount
        : selectedDiscount === 'custom'
        ? customPercentageDiscount.replace('%', '')
        : selectedDiscount.replace('%', '');
    const discount = parseFloat(discountStr);
    if (isNaN(discount)) {
      onConfirm(0, mode);
    } else {
      onConfirm(discount, mode);
    }
  };

  const renderPercentageOptions = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {[
        '10%',
        '20%',
        '30%',
        '40%',
        '50%',
        '60%',
        '70%',
        '80%',
        '90%',
        'custom',
      ].map((value) => (
        <Button
          key={value}
          variant={selectedDiscount === value ? 'contained' : 'outlined'}
          onClick={() => handleDiscountClick(value)}
          sx={{
            margin: '5px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            fontSize: '18px',
            borderColor:
              selectedDiscount === value ? 'pallet.primary' : 'grey.300',
            backgroundColor:
              selectedDiscount === value ? 'pallet.primary' : 'grey.300',
            color:
              selectedDiscount === value ? 'text.secondary' : 'text.primary',
          }}
        >
          {value === 'custom' ? 'カスタム' : value}
        </Button>
      ))}
      {selectedDiscount === 'custom' && (
        <TextField
          variant="outlined"
          value={customPercentageDiscount}
          onChange={handleCustomDiscountChange}
          placeholder="カスタム"
          InputProps={{
            endAdornment: <Typography>%</Typography>,
          }}
          sx={{
            marginTop: '10px',
            width: '100%',
          }}
        />
      )}
    </Box>
  );

  const renderAmountOptions = () => (
    <TextField
      variant="outlined"
      value={customAmountDiscount}
      onChange={handleCustomDiscountChange}
      placeholder="カスタム"
      InputProps={{
        endAdornment: <Typography>円</Typography>,
      }}
      sx={{
        marginTop: '10px',
        width: '100%',
      }}
    />
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
            position: 'relative',
            height: '60px',
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: '10px',
              color: 'common.white',
              minWidth: 'auto',
            }}
          >
            <FaTimes size={20} />
          </Button>
        </Box>
        <Box
          sx={{
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Button
              variant={mode === '%' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('%')}
              sx={{
                width: '48%',
                bgcolor: mode === '%' ? 'pallet.primary' : 'gray.200',
                color: mode === '%' ? 'text.secondary' : 'text.primary',
              }}
            >
              %
            </Button>
            <Button
              variant={mode === '円' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('円')}
              sx={{
                width: '48%',
                bgcolor: mode === '円' ? 'pallet.primary' : 'gray.200',
                color: mode === '円' ? 'text.secondary' : 'text.primary',
              }}
            >
              円
            </Button>
          </Box>
          {mode === '%' ? renderPercentageOptions() : renderAmountOptions()}
          <Button
            variant="contained"
            onClick={handleConfirmClick}
            sx={{
              marginTop: '10px',
              width: '100px',
              backgroundColor: 'pallet.primary',
              color: 'text.secondary',
            }}
          >
            確定
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DiscountModal;
