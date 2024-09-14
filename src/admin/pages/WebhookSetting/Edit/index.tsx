/* eslint-disable max-len */
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2.js';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { logger } from '../../../../utilities/logger.js';
import { MainCard } from '../../../@extended/components/MainCard/index.js';
import { ConfirmDiscardDialog } from '../../../components/elements/ConfirmDiscardDialog/index.js';
import { Icon } from '../../../components/elements/Icon/index.js';
import { ComposeWrapper } from '../../../components/utilities/ComposeWrapper/index.js';
import { createWebhookSettingValidator } from '../../../fields/validators/webhookSettings/createWebhookSetting.validator.js';
import { FormValues } from '../../../fields/validators/webhookSettings/values.js';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt.js';
import { useWebhookSetting, WebhookContextProvider } from '../Context/index.js';
import { CustomForm } from '../forms/Custom/index.js';
import { VercelForm } from '../forms/Vercel/index.js';

const EditWebhookSettingPageImpl: React.FC = () => {
  const { id } = useParams();
  if (!id) throw new Error('id is not defined');

  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { getWebhookSetting, updateWebhookSetting } = useWebhookSetting();
  const { data: webhookSetting } = getWebhookSetting(id);
  const { trigger, isMutating } = updateWebhookSetting(id);

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: webhookSetting.name,
      enabled: webhookSetting.enabled,
      provider: webhookSetting.provider,
      url: webhookSetting.url,
      onPublish: webhookSetting.onPublish,
      onArchive: webhookSetting.onArchive,
      onDeletePublished: webhookSetting.onDeletePublished,
    },
    resolver: yupResolver(createWebhookSettingValidator()),
  });
  const { showPrompt, proceed, stay } = useUnsavedChangesPrompt(isDirty);

  const providers = [
    {
      id: 'vercel',
      value: 'vercel',
      label: t('providers.vercel'),
      icon: <Icon name="Webhook" size={18} />,
    },
    {
      id: 'custom',
      value: 'custom',
      label: t('providers.custom'),
      icon: <Icon name="Webhook" size={18} />,
    },
  ];
  const provider = providers.filter((item) => item.value === webhookSetting.provider)[0];

  const notificationTriggers: {
    id: string;
    value: 'onPublish' | 'onArchive' | 'onDeletePublished';
    label: string;
  }[] = [
    {
      id: 'onPublish',
      value: 'onPublish',
      label: t('providers_field.on_publish'),
    },
    {
      id: 'onArchive',
      value: 'onArchive',
      label: t('providers_field.on_archive'),
    },
    {
      id: 'onDeletePublished',
      value: 'onDeletePublished',
      label: t('providers_field.on_delete_published'),
    },
  ];

  const navigateToList = () => {
    navigate('../webhooks');
  };

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      reset(form);
      await trigger(form);
      enqueueSnackbar(t('toast.updated_successfully'), {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
      });
      navigateToList();
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <>
      <ConfirmDiscardDialog open={showPrompt} onDiscard={proceed} onKeepEditing={stay} />
      <Grid container spacing={2.5}>
        <Grid xs={12} lg={8}>
          <MainCard>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Provider */}
                <Grid xs={12}>
                  <Controller
                    name="provider"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row value={field.value}>
                        <Grid container spacing={1.75} sx={{ ml: 0 }}>
                          <Grid>
                            <FormControlLabel
                              {...field}
                              value={provider.value}
                              control={<Radio value={provider.value} sx={{ display: 'none' }} />}
                              sx={{
                                display: 'flex',
                                '& .MuiFormControlLabel-label': { flex: 1 },
                              }}
                              label={
                                <MainCard
                                  content={false}
                                  sx={{
                                    bgcolor:
                                      field.value === provider.value
                                        ? 'primary.lighter'
                                        : 'secondary.lighter',
                                    p: 1,
                                  }}
                                  border={false}
                                  {...(field.value === provider.value && {
                                    boxShadow: true,
                                    shadow: theme.customShadows.primary,
                                  })}
                                >
                                  <Stack
                                    gap={1}
                                    flexDirection="row"
                                    alignItems="center"
                                    sx={{ p: 1 }}
                                  >
                                    {provider.icon}
                                    <Typography variant="subtitle1" color="textSecondary">
                                      {provider.label}
                                    </Typography>
                                  </Stack>
                                </MainCard>
                              }
                            />
                          </Grid>
                        </Grid>
                      </RadioGroup>
                    )}
                  />
                </Grid>

                {/* Name */}
                <Grid xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel required>{t('name')}</InputLabel>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="text"
                          fullWidth
                          error={errors.name !== undefined}
                        />
                      )}
                    />
                    <FormHelperText error>{errors.name?.message}</FormHelperText>
                  </Stack>
                </Grid>

                {/* Form */}
                {watch('provider') === 'vercel' && <VercelForm control={control} errors={errors} />}
                {watch('provider') === 'custom' && <CustomForm control={control} errors={errors} />}

                {/* Trigger */}
                <Grid xs={12}>
                  <InputLabel sx={{ mb: 2 }}>{t('notification_triggers')}</InputLabel>
                  <Grid container spacing={2}>
                    <Stack>
                      {notificationTriggers.map((item) => (
                        <Controller
                          name={item.value}
                          key={item.id}
                          control={control}
                          render={({ field }) => (
                            <>
                              <Grid sx={{ py: 0.5 }}>
                                <FormControlLabel
                                  {...field}
                                  value={field.value}
                                  control={<Checkbox checked={watch(item.value)} {...field} />}
                                  label={item.label}
                                />
                              </Grid>
                            </>
                          )}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <FormHelperText error>{errors.onPublish?.message}</FormHelperText>
                </Grid>

                {/* Enabled */}
                <Grid xs={12}>
                  <InputLabel sx={{ mb: 2 }}>{t('status')}</InputLabel>
                  <Grid container spacing={2}>
                    <Stack>
                      <Controller
                        name="enabled"
                        control={control}
                        render={({ field }) => (
                          <Grid sx={{ py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch checked={field.value} {...field} />}
                              label={t('enabled')}
                            />
                          </Grid>
                        )}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                <Grid xs={12}>
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button variant="outlined" color="secondary" onClick={navigateToList}>
                      {t('cancel')}
                    </Button>
                    <Button variant="contained" type="submit" disabled={isMutating}>
                      {t('save')}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export const EditWebhookSettingPage = ComposeWrapper({ context: WebhookContextProvider })(
  EditWebhookSettingPageImpl
);
