import { FormProvider, useFormContext, Controller } from 'react-hook-form';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Paper,
  Stack,
} from '@mui/material';
import { cardCondition } from '@/app/ec/(core)/constants/condition';
import { useDeckPurchaseOptionForm } from '@/feature/deck/useDeckPurchaseOptionForm';
import { DECK_OPTION_NAME_MAP } from '@/feature/deck/form-schema';
import { DeckAvailableProductsPriorityOption } from '@/app/ec/(core)/hooks/useEcDeck';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface DeckPurchaseOptionProps {
  deckId?: number;
  deckCode?: string;
}

export const DeckPurchaseOption = ({
  deckId,
  deckCode,
}: DeckPurchaseOptionProps) => {
  const { methods, onSubmit, isLoading } = useDeckPurchaseOptionForm(
    deckId,
    deckCode,
  );

  const handleClick = async () => {
    await onSubmit();
  };

  return (
    <FormProvider {...methods}>
      <FormFields />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <PrimaryButton
          onClick={handleClick}
          loading={isLoading}
          sx={{ minWidth: 200 }}
        >
          カートに入れる
        </PrimaryButton>
      </Box>
    </FormProvider>
  );
};

const FormFields = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={3} sx={{ mb: 3 }}>
      {/* 初期リリース時は非表示
      <FormSection title={DECK_OPTION_NAME_MAP.anyCardNumber}>
        <Controller
          name="anyCardNumber"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === 'true')}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="型番を問わない"
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="デッキリストと同じ"
              />
            </RadioGroup>
          )}
        />
      </FormSection>
      */}

      <FormSection title={DECK_OPTION_NAME_MAP.anyRarity}>
        <Controller
          name="anyRarity"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value === 'true')}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="レアリティを問わない"
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="デッキリストと同じ"
              />
            </RadioGroup>
          )}
        />
      </FormSection>

      <FormSection title={DECK_OPTION_NAME_MAP.conditionOption}>
        <Controller
          name="conditionOption"
          control={control}
          render={({ field }) => (
            <FormGroup>
              {cardCondition.map((condition) => (
                <FormControlLabel
                  key={condition.value}
                  control={
                    <Checkbox
                      checked={field.value.includes(condition.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, condition.value]);
                        } else {
                          field.onChange(
                            field.value.filter(
                              (val: string) => val !== condition.value,
                            ),
                          );
                        }
                      }}
                    />
                  }
                  label={condition.label}
                />
              ))}
            </FormGroup>
          )}
        />
        {errors.conditionOption && (
          <FormHelperText error>
            {errors.conditionOption.message as string}
          </FormHelperText>
        )}
      </FormSection>

      <FormSection title={DECK_OPTION_NAME_MAP.priorityOption}>
        <Controller
          name="priorityOption"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            >
              <FormControlLabel
                value={DeckAvailableProductsPriorityOption.COST}
                control={<Radio />}
                label="安いものを優先"
              />
              <FormControlLabel
                value={DeckAvailableProductsPriorityOption.SHIPPING_DAYS}
                control={<Radio />}
                label="発送日の早いショップを優先する"
              />
            </RadioGroup>
          )}
        />
      </FormSection>
    </Stack>
  );
};

// Helper component for form sections
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        '&:hover': {
          boxShadow: 3,
          transition: 'box-shadow 0.3s ease-in-out',
        },
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="medium"
        gutterBottom={false}
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>
      <Box sx={{ ml: 1 }}>{children}</Box>
    </Paper>
  );
};
