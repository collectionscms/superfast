import RenderFields from '@admin/components/forms/RenderFields';
import ComposeWrapper from '@admin/components/utilities/ComposeWrapper';
import { ContentContextProvider, useContent } from '@admin/stores/Content';
import { Button, Drawer, Stack, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ApiPreview from '../ApiPreview';
import { Props } from './types';

const SingletonPage: React.FC<Props> = ({ collection }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { getContents, getFields } = useContent();
  const { data: metaFields, error: getFieldsError } = getFields(collection.collection);
  const { data: contents, error: getContentsError } = getContents(collection.collection);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  useEffect(() => {
    if (getFieldsError === undefined) return;
    enqueueSnackbar(getFieldsError, { variant: 'error' });
  }, [getFieldsError]);

  useEffect(() => {
    if (getContentsError === undefined) return;
    enqueueSnackbar(getContentsError, { variant: 'error' });
  }, [getContentsError]);

  const onSubmit = (data) => {
    console.log('post data');
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ zIndex: theme.zIndex.appBar + 200 }}
      >
        <ApiPreview path={collection.collection} />
      </Drawer>
      <Grid container spacing={2}>
        <Grid xs>
          <h1>{collection.collection}</h1>
        </Grid>
        <Grid container columnSpacing={2} alignItems="center">
          <Grid>
            <Button variant="contained" onClick={toggleDrawer(true)}>
              {t('api_preview')}
            </Button>
          </Grid>
          <Grid>
            <Button variant="contained" type="submit">
              {t('update')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid container columns={{ xs: 1, lg: 2 }}>
        <Grid xs={1}>
          <Stack rowGap={3}>
            <RenderFields register={register} errors={errors} fields={metaFields || []} />
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default ComposeWrapper({ context: ContentContextProvider })(SingletonPage);
