import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import {
  Typography,
  Box,
  Popover,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
} from '@mui/material';
import { useMemo, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Props {
  findOption: FindOptionType;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
}

export const FindOptionSelectItem = ({
  findOption,
  selectedFindOption,
  handleChangeFindOption,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleToggle = (values: ChangeFindOptionType) => {
    const newChecked = checkedValues.includes(values.toggledValue)
      ? checkedValues.filter((v) => v !== values.toggledValue)
      : [...checkedValues, values.toggledValue];
    setCheckedValues(newChecked);
    handleChangeFindOption(values);
  };

  const filteredOptions = useMemo(
    () =>
      findOption.options.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [findOption.options, searchText],
  );

  const activeFilterCount = useMemo(() => {
    const targetOption = selectedFindOption.find(
      (option) => option.metaLabel === findOption.metaLabel,
    );
    return targetOption?.options.length;
  }, [findOption.metaLabel, selectedFindOption]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          px: 1,
          py: 0.5,
          cursor: 'pointer',
          backgroundColor: 'common.white',
        }}
        onClick={handleClick}
      >
        <Typography variant="body2">{findOption.metaLabel}</Typography>
        <Badge
          badgeContent={activeFilterCount}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              borderRadius: '50%',
              fontWeight: 'bold',
            },
            mr: 1,
            ml: activeFilterCount ? 2 : 0,
          }}
        ></Badge>
        <ArrowDropDownIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box
          p={2}
          minWidth={350}
          maxHeight={500}
          display="flex"
          flexDirection="column"
          gap={1}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            {findOption.metaLabel}
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="検索"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              pr: 1,
            }}
          >
            <FormGroup>
              {filteredOptions.map((option) => {
                const checkboxId = `${findOption.metaLabel}-${option.value}`;
                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        id={checkboxId}
                        name={findOption.columnOnPosItem}
                        checked={checkedValues.includes(option.value)}
                        onChange={() =>
                          handleToggle({
                            toggledValue: option.value,
                            toggledLabel: option.label,
                            metaLabel: findOption.metaLabel,
                            columnOnPosItem: findOption.columnOnPosItem,
                          })
                        }
                        sx={{
                          marginLeft: 1.5,
                          color: 'primary.main',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label={option.label}
                    htmlFor={checkboxId}
                  />
                );
              })}
            </FormGroup>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
