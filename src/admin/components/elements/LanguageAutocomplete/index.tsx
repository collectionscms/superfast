import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '../../../../constants/languages.js';
import { NationalFlagIcon } from '../NationalFlagIcon/index.js';

type Props = {
  languages: readonly LanguageCode[];
  value?: LanguageCode | null;
  autofocus?: boolean;
  onChange: (event: React.SyntheticEvent, newValue: LanguageCode | null) => void;
};

export const LanguageAutocomplete: React.FC<Props> = ({
  languages,
  value,
  autofocus = false,
  onChange,
}) => {
  const { t } = useTranslation();
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autofocus && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  return (
    <Autocomplete
      id="language-autocomplete"
      fullWidth
      value={value}
      options={languages}
      autoHighlight
      onChange={onChange}
      getOptionLabel={(option) =>
        `${t(`languages.${option.code}` as unknown as TemplateStringsArray)} (${option.code.toUpperCase()})`
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <NationalFlagIcon code={option.code} props={{ width: 20, mr: 1 }} />
          {t(`languages.${option.code}` as unknown as TemplateStringsArray)}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({option.code.toUpperCase()})
          </Typography>
          {!option.targetLanguageCode && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              - {t('untranslatable')}
            </Typography>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={textFieldRef}
          placeholder={t('choose_language')}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
          }}
        />
      )}
    />
  );
};
