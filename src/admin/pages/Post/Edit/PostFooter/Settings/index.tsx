import {
  AppBarProps,
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RevisedContent } from '../../../../../../types/index.js';
import { logger } from '../../../../../../utilities/logger.js';
import { IconButton } from '../../../../../@extended/components/IconButton/index.js';
import { MainCard } from '../../../../../@extended/components/MainCard/index.js';
import { Icon } from '../../../../../components/elements/Icon/index.js';
import { ModalDialog } from '../../../../../components/elements/ModalDialog/index.js';
import { useAuth } from '../../../../../components/utilities/Auth/index.js';
import { usePost } from '../../../Context/index.js';
import { AppBarStyled } from '../../AppBarStyled.js';
import { GeneralSettings } from '../../PostHeader/PublishSettings/GeneralSettings/index.js';
import { SeoSettings } from '../../PostHeader/PublishSettings/SeoSettings/index.js';
import { TagSettings } from '../../PostHeader/PublishSettings/TagSettings/index.js';

export type Props = {
  content: RevisedContent;
  onTrashed: () => void;
};

export const Settings: React.FC<Props> = ({ content, onTrashed }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { hasPermission } = useAuth();
  const { trashPost, trashContent, getContent } = usePost();
  const { trigger: trashPostTrigger } = trashPost(content.postId);
  const { trigger: trashContentTrigger } = trashContent(content.id);
  const { data: mutatedContent, mutate } = getContent(content.id);

  const [openContentTrash, setOpenContentTrash] = useState(false);
  const [openPostTrash, setOpenPostTrash] = useState(false);

  const [openSettings, setOpenSettings] = useState(false);
  const toggleOpenSettings = async () => {
    setOpenSettings(!openSettings);
  };

  const appBar: AppBarProps = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      zIndex: 1200,
      width: '100%',
    },
  };

  const toggleOpenLanguageContent = () => {
    setOpenContentTrash((open) => !open);
  };

  const toggleOpenPostTrash = () => {
    setOpenPostTrash((open) => !open);
  };

  const handleTrashContent = async () => {
    try {
      await trashContentTrigger();
      onTrashed();
      toggleOpenSettings();
      toggleOpenLanguageContent();
      enqueueSnackbar(t('toast.move_to_trash'), {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
      });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleTrashPost = async () => {
    try {
      await trashPostTrigger();
      enqueueSnackbar(t('toast.move_to_trash'), {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
      });
      toggleOpenPostTrash();
      navigate('/admin/posts');
    } catch (error) {
      logger.error(error);
    }
  };

  const handleUpdatedPost = ({
    slug = content.slug,
    metaTitle = content.metaTitle,
    metaDescription = content.metaDescription,
  }: {
    slug?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }) => {
    mutate({
      ...content,
      slug,
      metaTitle,
      metaDescription,
    });
  };

  return (
    <>
      <ModalDialog
        open={openContentTrash}
        color="error"
        title={t('dialog.confirm_content_trash_title', {
          language: t(`languages.${content.language}` as unknown as TemplateStringsArray),
        })}
        body={t('dialog.confirm_content_trash')}
        execute={{ label: t('move_to_trash'), action: handleTrashContent }}
        cancel={{ label: t('cancel'), action: toggleOpenLanguageContent }}
      />
      <ModalDialog
        open={openPostTrash}
        color="error"
        title={t('dialog.confirm_all_content_trash_title')}
        body={t('dialog.confirm_content_trash')}
        execute={{ label: t('move_to_trash'), action: handleTrashPost }}
        cancel={{ label: t('cancel'), action: toggleOpenPostTrash }}
      />
      <Tooltip title={t('setting')}>
        <IconButton
          color="secondary"
          shape="rounded"
          variant="contained"
          sx={{
            color: 'text.primary',
            backgroundColor: theme.palette.grey[200],
            '&:hover': { backgroundColor: theme.palette.grey[300] },
          }}
          onClick={toggleOpenSettings}
        >
          <Icon strokeWidth={2} name="Settings" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={openSettings}
        fullScreen
        sx={{ '& .MuiDialog-paper': { bgcolor: 'background.default', backgroundImage: 'none' } }}
      >
        <AppBarStyled open={true} {...appBar}>
          <Toolbar>
            <IconButton
              color="secondary"
              onClick={toggleOpenSettings}
              sx={{ p: 0, position: 'absolute' }}
            >
              <Icon name="X" size={28} />
            </IconButton>
            <Box width="100%">
              <Typography variant="h3" align="center">
                {t('language_post_settings', {
                  language: t(`languages.${content.language}` as unknown as TemplateStringsArray),
                })}
              </Typography>
            </Box>
          </Toolbar>
        </AppBarStyled>
        <Box component="main">
          <Toolbar sx={{ mt: 0 }} />
          <Container maxWidth="sm" sx={{ pb: 5 }}>
            {/* Slug */}
            <Stack sx={{ pt: 3, pb: 1.5 }}>
              <Typography variant={'h4'}>{t('general')}</Typography>
            </Stack>
            <MainCard>
              <GeneralSettings
                contentId={mutatedContent.id}
                slug={mutatedContent.slug}
                onUpdated={(slug) => handleUpdatedPost({ slug })}
              />
            </MainCard>

            {/* Tag */}
            <Stack sx={{ pt: 3, pb: 1.5 }}>
              <Typography variant={'h4'}>{t('tags')}</Typography>
            </Stack>
            <MainCard>
              <TagSettings contentId={mutatedContent.id} inputtedTags={mutatedContent.tags} />
            </MainCard>

            {/* SEO */}
            <Box sx={{ pt: 5 }}>
              <SeoSettings
                contentId={mutatedContent.id}
                metaTitle={mutatedContent.metaTitle ?? ''}
                metaDescription={mutatedContent.metaDescription ?? ''}
                onUpdated={(metaTitle, metaDescription) =>
                  handleUpdatedPost({
                    metaTitle,
                    metaDescription,
                  })
                }
              />
            </Box>

            {/* Trash post */}
            {hasPermission('trashPost') && (
              <>
                <Stack sx={{ pt: 5, pb: 1.5 }}>
                  <Typography variant={'h4'}>{t('danger_zone')}</Typography>
                </Stack>
                <MainCard>
                  {content.languageContents.length > 1 && (
                    <>
                      <Stack flexDirection="row">
                        <Box flexGrow="1">
                          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                            {t('remove_language_content', {
                              language: t(
                                `languages.${content.language}` as unknown as TemplateStringsArray
                              ),
                            })}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {t('move_lang_content_to_trash', {
                              language: t(
                                `languages.${content.language}` as unknown as TemplateStringsArray
                              ),
                            })}
                          </Typography>
                        </Box>
                        <Button
                          color="error"
                          startIcon={<Icon name="Trash2" size={16} />}
                          sx={{ pl: 1.5 }}
                          onClick={toggleOpenLanguageContent}
                        >
                          {t('move_to_trash')}
                        </Button>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                    </>
                  )}
                  <Stack flexDirection="row">
                    <Box flexGrow="1">
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {t('delete_post')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('move_all_lang_content_to_trash')}
                      </Typography>
                    </Box>
                    <Button
                      color="error"
                      startIcon={<Icon name="Trash2" size={16} />}
                      sx={{ pl: 1.5 }}
                      onClick={toggleOpenPostTrash}
                    >
                      {t('move_to_trash')}
                    </Button>
                  </Stack>
                </MainCard>
              </>
            )}
          </Container>
        </Box>
      </Dialog>
    </>
  );
};
