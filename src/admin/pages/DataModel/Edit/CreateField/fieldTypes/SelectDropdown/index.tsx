import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2.js';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../../../../../utilities/logger.js';
import { shallowEqualObject } from '../../../../../../../utilities/shallowEqualObject.js';
import { ConfirmDiscardDialog } from '../../../../../../components/elements/ConfirmDiscardDialog/index.js';
import { Choice } from '../../../../../../config/types.js';
import {
  FormValues,
  createSelectDropdown as schema,
} from '../../../../../../fields/schemas/modelFields/selectDropdown/createSelectDropdown.js';
import { useUnsavedChangesPrompt } from '../../../../../../hooks/useUnsavedChangesPrompt.js';
import { Accordion } from '../../../Accordion/index.js';
import { ChoiceField } from '../../../ChoiceField/index.js';
import { DropdownChoice } from '../../../EditField/fieldTypes/SelectDropdown/DropdownChoice/index.js';
import { useField } from '../../Context/index.js';
import { Props } from '../types.js';

export const SelectDropdownType: React.FC<Props> = (props) => {
  const { model, expanded, handleChange, onEditing, onSuccess, onChangeParentViewInvisible } =
    props;
  const [state, setState] = useState(false);
  const [choiceValue, setChoiceValue] = useState<{ id: string; label: string; value: string }>();
  const { t } = useTranslation();
  const { createField } = useField();
  const { trigger, isMutating } = createField();
  const defaultValues = { field: '', label: '', required: false, choices: [] };
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema(t)),
  });
  const { showPrompt, proceed, stay } = useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    watch((value) => {
      const values: Partial<{ choices: unknown[] }> = { ...defaultValues };
      delete values.choices;
      const isEqualed = shallowEqualObject(values, value);
      onEditing(!isEqualed || (value.choices || []).length > 0);
    });
  }, [watch]);

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const toggleChoiceField = (state: boolean) => {
    setState(state);
    onChangeParentViewInvisible?.(state);
  };

  // /////////////////////////////////////
  // Operation to drawer
  // /////////////////////////////////////

  const onToggleCreateChoice = () => {
    setChoiceValue({ id: '', label: '', value: '' });
    toggleChoiceField(true);
  };

  const onToggleUpdateChoice = (field: { id: string; label: string; value: string }) => {
    setChoiceValue(field);
    toggleChoiceField(true);
  };

  // /////////////////////////////////////
  // Operation to choices
  // /////////////////////////////////////

  const handleDeleteChoice = (id: string) => {
    const index = fields.findIndex((field) => field.id === id);
    remove(index);
  };

  const handleSaveChoice = (id: string | null, choice: Choice) => {
    if (id) {
      const index = fields.findIndex((field) => field.id === id);
      update(index, choice);
    } else {
      append(choice);
    }

    toggleChoiceField(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      reset(form);
      const field = await trigger({
        model: model.model,
        modelId: model.id,
        field: form.field,
        label: form.label,
        interface: 'selectDropdown',
        required: form.required,
        readonly: false,
        hidden: false,
        options: { choices: form.choices },
      });
      onSuccess(field!);
    } catch (e) {
      logger.error(e);
    }
  };

  return (
    <>
      <ConfirmDiscardDialog open={showPrompt} onDiscard={proceed} onKeepEditing={stay} />
      <ChoiceField
        openState={state}
        values={choiceValue}
        onSave={(id, choice) => handleSaveChoice(id, choice)}
        onClose={() => toggleChoiceField(false)}
      />
      <Accordion
        expanded={expanded}
        title={t('field_interface.select_dropdown')}
        description={t('field_interface.select_dropdown_caption')}
        icon={UnorderedListOutlined}
        type="middle"
        handleChange={() => handleChange('selectDropdown')}
      >
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} rowGap={3}>
          <Grid container spacing={3} columns={{ xs: 1, sm: 4 }}>
            <Grid xs={1} sm={2}>
              <Stack spacing={1}>
                <InputLabel required>{t('field_name')}</InputLabel>
                <Controller
                  name="field"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      fullWidth
                      placeholder={`${t('input_placeholder')} name`}
                      error={errors.field !== undefined}
                    />
                  )}
                />
                <FormHelperText error>{errors.field?.message}</FormHelperText>
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
                <InputLabel>{t('required_fields')}</InputLabel>
                <Controller
                  name="required"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      {...field}
                      label={t('required_at_creation')}
                      control={<Checkbox />}
                    />
                  )}
                />
                <FormHelperText error>{errors.required?.message}</FormHelperText>
              </Stack>
            </Grid>
          </Grid>
          <Divider />
          <Typography>{t('choices')}</Typography>
          <Stack rowGap={1}>
            {fields.length > 0 ? (
              fields.map((field) => (
                <DropdownChoice
                  key={field.id}
                  field={{
                    id: field.id,
                    label: field.label,
                    value: field.value,
                  }}
                  onEdit={(field) => onToggleUpdateChoice(field)}
                  onDelete={(id) => handleDeleteChoice(id)}
                />
              ))
            ) : (
              <Typography variant="caption">{t('no_choice')}</Typography>
            )}
          </Stack>
          <Button
            variant="outlined"
            startIcon={<PlusOutlined style={{ fontSize: '10px' }} />}
            onClick={onToggleCreateChoice}
          >
            {t('add_new_choice')}
          </Button>
          <Button variant="contained" type="submit" disabled={isMutating} fullWidth>
            {t('save')}
          </Button>
        </Stack>
      </Accordion>
    </>
  );
};