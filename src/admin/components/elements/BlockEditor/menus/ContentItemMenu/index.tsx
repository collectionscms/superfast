import { Paper, Stack, Typography } from '@mui/material';
import * as Popover from '@radix-ui/react-popover';
import DragHandle from '@tiptap-pro/extension-drag-handle-react';
import { Editor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../Icon/index.js';
import { DropdownButton } from '../../parts/DropdownButton/index.js';
import { ToolbarButton } from '../../parts/ToolbarButton/index.js';
import { useContentItemActions } from './hooks/useContentItemActions.js';
import { useData } from './hooks/useData.js';

export type Props = {
  editor: Editor;
};

export const ContentItemMenu: React.FC<Props> = ({ editor }) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useData();
  const actions = useContentItemActions(editor, data.currentNodePos);

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true);
    } else {
      editor.commands.setMeta('lockDragHandle', false);
    }
  }, [editor, menuOpen]);

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      tippyOptions={{
        offset: [-2, 16],
        zIndex: 99,
      }}
    >
      <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          <ToolbarButton>
            <Icon name="GripVertical" />
          </ToolbarButton>
        </Popover.Trigger>
        <Popover.Content side="bottom" align="start">
          <Paper
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5,
              boxShadow: '0px 9px 24px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Stack>
              <DropdownButton
                color="error"
                onClick={() => {
                  setMenuOpen(false);
                  actions.deleteNode();
                }}
                sx={{
                  color: 'error.main',
                }}
              >
                <Icon name="Trash2" size={16} />
                <Typography sx={{ ml: 1 }}>{t('delete')}</Typography>
              </DropdownButton>
            </Stack>
          </Paper>
        </Popover.Content>
      </Popover.Root>
    </DragHandle>
  );
};
