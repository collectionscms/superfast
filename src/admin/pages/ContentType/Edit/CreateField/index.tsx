import { CloseOutlined } from '@ant-design/icons';
import { Box, Drawer, Stack, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'superfast-ui';
import { Field, FieldInterface } from '../../../../config/types.js';
import { BaseDialog } from '../../../../components/elements/BaseDialog/index.js';
import { ScrollBar } from '../../../../components/elements/ScrollBar/index.js';
import { ComposeWrapper } from '../../../../components/utilities/ComposeWrapper/index.js';
import { FieldContextProvider } from './Context/index.js';
import { BooleanType } from './fieldTypes/Boolean/index.js';
import { DateTimeType } from './fieldTypes/DateTime/index.js';
import { FileImageType } from './fieldTypes/FileImage/index.js';
import { InputType } from './fieldTypes/Input/index.js';
import { InputMultilineType } from './fieldTypes/InputMultiline/index.js';
import { InputRichTextMdType } from './fieldTypes/InputRichTextMd/index.js';
import { ListOneToManyType } from './fieldTypes/ListOneToMany/index.js';
import { SelectDropdownType } from './fieldTypes/SelectDropdown/index.js';
import { Props } from './types.js';

const CreateFieldImpl: React.FC<Props> = ({ collection, openState, onSuccess, onClose }) => {
  const [fieldInterface, setFieldInterface] = useState<FieldInterface | null>(null);
  const [drawerVisibility, setDrawerVisibility] = useState(false);
  const [editing, setEditing] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const onToggle = () => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    onDrawerClose();
  };

  const onDrawerClose = () => {
    editing ? setOpenUnsavedDialog(true) : onClose();
  };

  // /////////////////////////////////////
  // Add field interface
  // /////////////////////////////////////

  // Choose to continue editing on the discard of a field edit.
  const handleKeepEditing = () => {
    setOpenUnsavedDialog(false);
  };

  // Choose to discard changes on the discard of a field edit.
  const handleDiscardChanges = () => {
    setOpenUnsavedDialog(false);
    setEditing(false);
    onClose();
  };

  const handleEditing = (unsaved: boolean) => {
    setEditing(unsaved);
  };

  const handleAdditionSuccess = (field: Field) => {
    setEditing(false);
    onSuccess(field);
  };

  const onSelectedFieldInterface = (field: FieldInterface) => {
    fieldInterface === field ? setFieldInterface(null) : setFieldInterface(field);
  };

  const onChangeParentViewInvisible = (state: boolean) => {
    setDrawerVisibility(state);
  };

  return (
    <Box>
      <BaseDialog
        open={openUnsavedDialog}
        title={t('dialog.unsaved_changes_title')}
        body={t('dialog.unsaved_changes')}
        confirm={{ label: t('dialog.discard_changes'), action: handleDiscardChanges }}
        cancel={{ label: t('dialog.keep_editing'), action: handleKeepEditing }}
      />
      <Drawer
        anchor="right"
        open={openState}
        onClose={onToggle()}
        sx={{
          '& .MuiAccordion-root': {
            borderColor: theme.palette.divider,
            '& .MuiAccordionSummary-root': {
              bgcolor: 'transparent',
              flexDirection: 'row',
              '&:focus-visible': {
                bgcolor: 'primary.lighter',
              },
            },
            '& .MuiAccordionDetails-root': {
              borderColor: theme.palette.divider,
            },
            '& .Mui-expanded': {
              color: theme.palette.primary.main,
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: 340, md: 660 },
          },
        }}
        hidden={drawerVisibility}
      >
        <ScrollBar
          sx={{
            '& .simplebar-content': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">{t('select_field_type')}</Typography>
              <IconButton
                color="secondary"
                size="small"
                sx={{ fontSize: '0.875rem' }}
                onClick={onDrawerClose}
              >
                <CloseOutlined />
              </IconButton>
            </Stack>
          </Box>
          <InputType
            collection={collection}
            expanded={fieldInterface === 'input'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <InputMultilineType
            collection={collection}
            expanded={fieldInterface === 'inputMultiline'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <InputRichTextMdType
            collection={collection}
            expanded={fieldInterface === 'inputRichTextMd'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <SelectDropdownType
            collection={collection}
            expanded={fieldInterface === 'selectDropdown'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
            onChangeParentViewInvisible={onChangeParentViewInvisible}
          />
          <DateTimeType
            collection={collection}
            expanded={fieldInterface === 'dateTime'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <BooleanType
            collection={collection}
            expanded={fieldInterface === 'boolean'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <FileImageType
            collection={collection}
            expanded={fieldInterface === 'fileImage'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
          <ListOneToManyType
            collection={collection}
            expanded={fieldInterface === 'listOneToMany'}
            handleChange={(field) => onSelectedFieldInterface(field)}
            onEditing={handleEditing}
            onSuccess={handleAdditionSuccess}
          />
        </ScrollBar>
      </Drawer>
    </Box>
  );
};

export const CreateField = ComposeWrapper({ context: FieldContextProvider })(CreateFieldImpl);
