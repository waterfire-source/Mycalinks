import SecondaryButton from '@/components/buttons/SecondaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  IsRegion,
  RegionName,
  RegionPrefectureMap,
  RegionSettingDef,
} from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';
import {
  Box,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  regions: RegionSettingDef['regionRate'];
  handleFeeChange: (fieldName: string) => (value: number) => void;
  isRegionSetting: IsRegion;
  setIsRegionSetting: Dispatch<SetStateAction<IsRegion>>;
}

export const AreaPostage = ({
  regions,
  handleFeeChange,
  isRegionSetting,
  setIsRegionSetting,
}: Props) => {
  return (
    <>
      <Grid item xs={4} sx={{ alignSelf: 'center' }}>
        {/* 送料 */}
        <Typography>送料</Typography>
      </Grid>
      <TableContainer sx={{ mx: 3, border: '1px solid grey' }}>
        <Table>
          {(Object.entries(isRegionSetting) as [RegionName, boolean][]).map(
            ([areaName, value]) =>
              value ? (
                <>
                  <TableHead>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        p: 1,
                        borderBottom: '1px solid grey',
                        backgroundColor: 'grey.00',
                      }}
                    >
                      <Typography sx={{ alignSelf: 'center' }}>
                        {areaName.replace('一律', '')}
                      </Typography>
                      <SecondaryButton
                        onClick={() =>
                          setIsRegionSetting((prev) => ({
                            ...prev,
                            [areaName]: false,
                          }))
                        }
                      >
                        県別で設定
                      </SecondaryButton>
                    </Box>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          borderBottom: '1px solid grey',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            sx={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
                          >
                            エリア一律
                          </Typography>
                          <NumericTextField
                            fullWidth
                            name={areaName}
                            value={
                              regions.find(
                                (region) => region.regionHandle === areaName,
                              )?.fee
                            }
                            onChange={handleFeeChange(areaName)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography sx={{ color: 'text.primary' }}>
                                    円
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                            sx={{ maxWidth: '150px' }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </>
              ) : (
                <>
                  <TableHead>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        p: 1,
                        borderBottom: '1px solid grey',
                        backgroundColor: 'grey.00',
                      }}
                    >
                      <Typography sx={{ alignSelf: 'center' }}>
                        {areaName.replace('一律', '')}
                      </Typography>
                      <SecondaryButton
                        onClick={() =>
                          setIsRegionSetting((prev) => ({
                            ...prev,
                            [areaName]: true,
                          }))
                        }
                      >
                        エリアで設定
                      </SecondaryButton>
                    </Box>
                  </TableHead>
                  <TableBody>
                    {RegionPrefectureMap[areaName].map((prefecture, value) => (
                      <TableRow key={value}>
                        <TableCell
                          sx={{
                            borderBottom: '1px solid grey',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              sx={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
                            >
                              {prefecture.name}
                            </Typography>
                            <NumericTextField
                              fullWidth
                              name={prefecture.name}
                              value={
                                regions.find(
                                  (region) =>
                                    region.regionHandle === prefecture.name,
                                )?.fee
                              }
                              onChange={handleFeeChange(prefecture.name)}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Typography sx={{ color: 'text.primary' }}>
                                      円
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ maxWidth: '150px' }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </>
              ),
          )}
        </Table>
      </TableContainer>
    </>
  );
};
