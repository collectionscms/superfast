import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { logger } from '../../../../utilities/logger.js';
import { IconButton } from '../../../@extended/components/IconButton/index.js';
import { useBlockEditor } from '../../../components/elements/BlockEditor/hooks/useBlockEditor.js';
import { BlockEditor } from '../../../components/elements/BlockEditor/index.js';
import { ConfirmDiscardDialog } from '../../../components/elements/ConfirmDiscardDialog/index.js';
import { Icon } from '../../../components/elements/Icon/index.js';
import { useColorMode } from '../../../components/utilities/ColorMode/index.js';
import { ComposeWrapper } from '../../../components/utilities/ComposeWrapper/index.js';
import { useUnsavedChangesPrompt } from '../../../hooks/useUnsavedChangesPrompt.js';
import { AddLanguage } from '../AddLanguage/index.js';
import { PostContextProvider, usePost } from '../Context/index.js';
import { PostFooter } from './PostFooter/index.js';
import { PostHeader } from './PostHeader/index.js';
import { PublishSettings } from './PostHeader/PublishSettings/index.js';
import { LoadingOutlined } from '@ant-design/icons';

const toJson = (value?: string | null) => {
  return value ? JSON.parse(value) : '';
};

export const EditPostPageImpl: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) throw new Error('id is not defined');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const language = queryParams.get('language');

  const { getPost, updateContent, createFileImage, translateContent } = usePost();
  const { data: post, mutate } = getPost(id, language);
  const { trigger: updateContentTrigger, isMutating: isSaving } = updateContent(post.contentId);
  const { trigger: translateTrigger } = translateContent(post.id);

  const [isDirty, setIsDirty] = useState(false);
  const { showPrompt, proceed, stay } = useUnsavedChangesPrompt(isDirty);

  if (!post) return <></>;

  useEffect(() => {
    setPostTitle(post.title);
    setUploadCover(post.coverUrl ?? null);
    editor?.commands.setContent(toJson(post.bodyJson));
  }, [post]);

  // /////////////////////////////////////
  // Editor
  // /////////////////////////////////////

  const [postTitle, setPostTitle] = useState(post.title);

  const handleChangeTitle = (value: string) => {
    setPostTitle(value);
    setIsDirty(true);
  };

  const { mode } = useColorMode();
  const ref = React.useRef<HTMLButtonElement>(null);
  const { editor, characterCount } = useBlockEditor({
    initialContent: toJson(post.bodyJson),
    ref: ref,
    mode,
  });

  useEffect(() => {
    if (isDirty) {
      // auto save after 5 seconds
      const timer = setTimeout(async () => {
        await handleSaveContent();
        setIsDirty(false);
      }, 5_000);

      return () => clearTimeout(timer);
    }
  }, [isDirty, postTitle, editor?.getText()]);

  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        setIsDirty(true);
      };

      editor.on('update', handleUpdate);

      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor]);

  // /////////////////////////////////////
  // Theme
  // /////////////////////////////////////

  const theme = useTheme();

  // /////////////////////////////////////
  // Short cut
  // /////////////////////////////////////

  useHotkeys('Meta+s', async () => ref.current?.click(), [], {
    preventDefault: true,
    enableOnFormTags: ['INPUT', 'TEXTAREA'],
  });

  // /////////////////////////////////////
  // File Image
  // /////////////////////////////////////

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadCover, setUploadCover] = useState<string | null>(post.coverUrl);
  const { trigger: createFileImageTrigger } = createFileImage();

  const handleUploadCover = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    const params = new FormData();
    params.append('file', file);

    const res = await createFileImageTrigger(params);
    const uploadedFile = res.files[0];
    setUploadCover(uploadedFile.url);

    try {
      await saveContent({
        ...buildParams(),
        coverUrl: uploadedFile.url,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  const handleDeleteCover = async () => {
    setUploadCover(null);
    try {
      await saveContent({
        ...buildParams(),
        coverUrl: null,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  // /////////////////////////////////////
  // Save content
  // /////////////////////////////////////

  const buildParams = () => {
    return {
      title: postTitle,
      body: editor?.getText() ?? null,
      bodyJson: JSON.stringify(editor?.getJSON()) ?? null,
      bodyHtml: editor?.getHTML() ?? null,
      coverUrl: uploadCover ?? null,
    };
  };

  const handleSaveContent = async () => {
    try {
      await saveContent(buildParams());
    } catch (error) {
      logger.error(error);
    }
  };

  const saveContent = async (data: {
    title: string;
    body: string | null;
    bodyJson: string | null;
    bodyHtml: string | null;
    coverUrl: string | null;
  }) => {
    await updateContentTrigger(data);
    setIsDirty(false);
    mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
    e.preventDefault();
    editor?.commands.focus();
  };

  // /////////////////////////////////////
  // Content actions
  // /////////////////////////////////////

  const handleMutate = () => {
    mutate();
  };

  // /////////////////////////////////////
  // Open settings
  // /////////////////////////////////////

  const [openPublishSettings, setOpenPublishSettings] = useState(false);
  const handleOpenPublishSettings = async () => {
    if (isDirty) {
      await handleSaveContent();
    }
    setOpenPublishSettings((open) => !open);
  };

  // /////////////////////////////////////
  // Language
  // /////////////////////////////////////

  const handleChangeLanguage = (language: string) => {
    navigate(`${window.location.pathname}?language=${language}`);
  };

  const [openAddLanguage, setOpenAddLanguage] = useState(false);
  const handleOpenAddLanguage = () => {
    setOpenAddLanguage(true);
  };

  const handleCloseAddLanguage = () => {
    setOpenAddLanguage(false);
  };

  const handleAddedLanguage = (language: string) => {
    setOpenAddLanguage(false);
    handleChangeLanguage(language);
    mutate({
      ...post,
      usedLanguages: [...post.usedLanguages, language],
    });
  };

  const [isTranslating, setIsTranslating] = useState(false);
  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const response = await translateTrigger({
        sourceLanguage: post.sourceLanguageCode,
        targetLanguage: post.targetLanguageCode,
      });
      handleChangeTitle(response.title);
      editor?.commands.setContent(response.body);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <Button ref={ref} onClick={handleSaveContent} />
      <ConfirmDiscardDialog open={showPrompt} onDiscard={proceed} onKeepEditing={stay} />
      <PostHeader
        post={post}
        currentLanguage={post.language}
        isSaving={isSaving}
        onChangeLanguage={handleChangeLanguage}
        onOpenAddLanguage={handleOpenAddLanguage}
        onReverted={handleMutate}
        onOpenPublishSettings={handleOpenPublishSettings}
      />
      <PostFooter
        post={post}
        onTrashed={handleMutate}
        onReverted={handleMutate}
        characters={characterCount.characters()}
      />
      <PublishSettings
        open={openPublishSettings}
        contentId={post.contentId}
        post={post}
        onClose={() => setOpenPublishSettings(false)}
      />
      <Box component="main" sx={{ minHeight: '100vh' }}>
        <Toolbar sx={{ mt: 0 }} />
        <Container sx={{ py: 6 }}>
          <Box sx={{ maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {post.title.length === 0 && post.body.length === 0 && post.canTranslate && (
              <Stack direction="row" gap={1} sx={{ mb: 4, alignItems: 'center' }} color="secondary">
                <Icon name="Languages" size={16} />
                <Typography>
                  {t('translate_source_to_target', {
                    sourceLanguage: t(
                      `languages.${post.sourceLanguageCode}` as unknown as TemplateStringsArray
                    ),
                    targetLanguage: t(
                      `languages.${post.targetLanguageCode}` as unknown as TemplateStringsArray
                    ),
                  })}
                </Typography>
                {isTranslating ? (
                  <>
                    <Box
                      width={64}
                      height={40}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <LoadingOutlined size={14} />
                    </Box>
                  </>
                ) : (
                  <Button
                    variant="text"
                    size="small"
                    color="secondary"
                    sx={{
                      width: 40,
                      height: 40,
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textUnderlineOffset: '0.3rem',
                    }}
                    onClick={handleTranslate}
                  >
                    {t('i_do')}
                  </Button>
                )}
              </Stack>
            )}
            <Box sx={{ mb: 2 }}>
              {uploadCover ? (
                <Box
                  sx={{
                    position: 'relative',
                  }}
                >
                  <IconButton
                    shape="rounded"
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: alpha('#fff', 0.7),
                    }}
                    onClick={handleDeleteCover}
                  >
                    <Icon name="X" size={20} strokeWidth={1.5} />
                  </IconButton>
                  <img
                    src={uploadCover}
                    style={{
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ) : (
                <Button variant="text" color="secondary" component="label">
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Icon name="Image" size={16} />
                    <Typography variant="button">{t('add_cover')}</Typography>
                    <input
                      hidden
                      ref={inputRef}
                      accept="image/*"
                      type="file"
                      onChange={handleUploadCover}
                    />
                  </Stack>
                </Button>
              )}
            </Box>

            <Stack spacing={1} sx={{ mb: 8 }}>
              <TextField
                type="text"
                fullWidth
                multiline
                placeholder={t('title')}
                value={postTitle}
                autoFocus
                onChange={(e) => handleChangeTitle(e.target.value)}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    border: 'none !important',
                  },
                  '.MuiOutlinedInput-root': {
                    padding: 0,
                    lineHeight: 1.85,
                  },
                  '.MuiOutlinedInput-input': {
                    color: theme.palette.text.primary,
                  },
                  '.Mui-focused': {
                    boxShadow: 'none !important',
                  },
                  '& fieldset': { border: 'none' },
                  p: 0,
                }}
                inputProps={{
                  style: {
                    padding: 0,
                    fontSize: '1.875rem',
                    lineHeight: '2.25rem',
                  },
                }}
                onKeyDown={handleKeyDown}
              />
            </Stack>
          </Box>
          <BlockEditor editor={editor} />
        </Container>
      </Box>
      <AddLanguage
        open={openAddLanguage}
        post={post}
        onClose={handleCloseAddLanguage}
        onChanged={(language) => handleAddedLanguage(language)}
      />
    </>
  );
};

export const EditPostPage = ComposeWrapper({ context: PostContextProvider })(EditPostPageImpl);
