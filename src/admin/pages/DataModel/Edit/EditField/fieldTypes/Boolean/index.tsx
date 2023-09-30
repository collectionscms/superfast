import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Stack,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2.js';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../../../../../utilities/logger.js';
import { shallowEqualObject } from '../../../../../../../utilities/shallowEqualObject.js';
import { ConfirmDiscardDialog } from '../../../../../../components/elements/ConfirmDiscardDialog/index.js';
import {
  FormValues,
  updateBoolean as schema,
} from '../../../../../../fields/schemas/modelFields/boolean/updateBoolean.js';
import { useUnsavedChangesPrompt } from '../../../../../../hooks/useUnsavedChangesPrompt.js';
import { useField } from '../../Context/index.js';
import { Props } from '../types.js';

export const BooleanType: React.FC<Props> = (props) => {
  const { field: meta, onEditing, onSuccess } = props;
  const { t } = useTranslation();
  const { updateField } = useField();
  const { trigger, isMutating } = updateField(meta.id);
  const defaultValues = {
    label: meta.label,
    default_value: meta?.fieldOption?.defaultValue,
    required: Boolean(meta.required),
    readonly: Boolean(meta.readonly),
    hidden: Boolean(meta.hidden),
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { showPrompt, proceed, stay } = useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    watch((value) => {
      const isEqualed = shallowEqualObject(defaultValues, value);
      onEditing(!isEqualed);
    });
  }, [watch]);

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      reset(form);
      const formData = {
        label: form.label,
        options: JSON.stringify({ defaultValue: form.default_value }),
        required: form.required,
        readonly: form.readonly,
        hidden: form.hidden,
      };
      await trigger(formData);
      onSuccess({
        ...meta,
        ...formData,
      });
    } catch (e) {
      logger.error(e);
    }
  };

  return (
    <>
      <ConfirmDiscardDialog open={showPrompt} onDiscard={proceed} onKeepEditing={stay} />
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} rowGap={3}>
        <Grid container spacing={3} columns={{ xs: 1, sm: 4 }}>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel required>{t('field_name')}</InputLabel>
              <TextField type="text" fullWidth disabled defaultValue={meta.field} />
            </Stack>
          </Grid>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel required>{t('label')}</InputLabel>
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="text"
                    fullWidth
                    placeholder={`${t('input_placeholder')} ${t('name')}`}
                    error={errors.label !== undefined}
                  />
                )}
              />
              <FormHelperText error>{errors.label?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel>{t('default_value')}</InputLabel>
              <Controller
                name="default_value"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label={t('enabled')}
                    control={<Checkbox checked={field.value} />}
                  />
                )}
              />
              <FormHelperText error>{errors.default_value?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel>{t('required_fields')}</InputLabel>
              <Controller
                name="required"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label={t('required_at_creation')}
                    control={<Checkbox checked={field.value} />}
                  />
                )}
              />
              <FormHelperText error>{errors.required?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel>{t('readonly')}</InputLabel>
              <Controller
                name="readonly"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label={t('disable_editing_value')}
                    control={<Checkbox checked={field.value} />}
                  />
                )}
              />
              <FormHelperText error>{errors.readonly?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={1} sm={2}>
            <Stack spacing={1}>
              <InputLabel>{t('status')}</InputLabel>
              <Controller
                name="hidden"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label={t('hidden_on_detail')}
                    control={<Checkbox checked={field.value} />}
                  />
                )}
              />
              <FormHelperText error>{errors.hidden?.message}</FormHelperText>
            </Stack>
          </Grid>
        </Grid>
        <Button variant="contained" type="submit" disabled={isMutating} fullWidth>
          {t('save')}
        </Button>
      </Stack>
    </>
  );
};