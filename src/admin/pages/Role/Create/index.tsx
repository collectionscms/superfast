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
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MainCard } from 'superfast-ui';
import { logger } from '../../../../utilities/logger.js';
import { ComposeWrapper } from '../../../components/utilities/ComposeWrapper/index.js';
import {
  FormValues,
  createRole as createRoleSchema,
} from '../../../fields/schemas/roles/createRole.js';
import { RoleContextProvider, useRole } from '../Context/index.js';

const CreateRolePageImpl: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { createRole } = useRole();
  const { trigger, isMutating } = createRole();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      admin_access: false,
    },
    resolver: yupResolver(createRoleSchema()),
  });

  const navigateToList = () => {
    navigate('../roles');
  };

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      const roleId = await trigger(form);
      enqueueSnackbar(t('toast.created_successfully'), { variant: 'success' });
      navigate(`../roles/${roleId}`);
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <Grid container spacing={2.5}>
      <Grid xs={12} lg={8}>
        <MainCard>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
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
              <Grid xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>{t('admin_access')}</InputLabel>
                  <Controller
                    name="admin_access"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        {...field}
                        label={t('is_active')}
                        control={<Checkbox checked={field.value} />}
                      />
                    )}
                  />
                  <FormHelperText error>{errors.admin_access?.message}</FormHelperText>
                </Stack>
              </Grid>
              <Grid xs={12}>
                <Stack spacing={1}>
                  <InputLabel>{t('description')}</InputLabel>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="text"
                        fullWidth
                        error={errors.description !== undefined}
                      />
                    )}
                  />
                  <FormHelperText error>{errors.description?.message}</FormHelperText>
                </Stack>
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
  );
};

export const CreateRolePage = ComposeWrapper({ context: RoleContextProvider })(CreateRolePageImpl);
