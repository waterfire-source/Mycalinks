import { SelectedPlatForm } from '@/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/NewPublishProductModal';
import { ecShopCommonConstants } from '@/constants/ecShops';
import { Stack, Box, Typography } from '@mui/material';
import Image from 'next/image';
import CheckIcon from '@mui/icons-material/Check';

interface PublishStoreInfo {
  displayName: string;
  icon: string;
  ImageUrl?: string;
}

interface Props {
  selectedPlatForm: SelectedPlatForm[];
  setSelectedPlatForm: React.Dispatch<React.SetStateAction<SelectedPlatForm[]>>;
}

export const SelectPlatForm = ({
  selectedPlatForm,
  setSelectedPlatForm,
}: Props) => {
  const handleClick = (shopName: string) => {
    setSelectedPlatForm((prev) =>
      prev.map((platform) =>
        platform.shopName === shopName
          ? { ...platform, selected: !platform.selected }
          : platform,
      ),
    );
  };

  return (
    <Box ml={3}>
      <Stack direction="row">
        <Typography>
          出品するプラットフォームを選択してください（複数選択可能）
        </Typography>
      </Stack>
      <Stack direction="row" spacing={3} mt={3}>
        {ecShopCommonConstants.shopInfo.map((platform, index) => {
          const isSelected = selectedPlatForm.find(
            (item) => item.shopName === platform.shopName,
          )?.selected;

          return (
            <Box
              key={index}
              sx={{
                width: 200,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'black',
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleClick(platform.shopName)}
            >
              {platform.shopImageUrl ? (
                <Image
                  src={platform.shopImageUrl}
                  width={150}
                  height={40}
                  alt={platform.shopName}
                />
              ) : (
                <Typography>{platform.shopName}</Typography>
              )}
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    right: -15,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <CheckIcon sx={{ color: 'white', fontSize: 30 }} />
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
