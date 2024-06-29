import { UserOutlined } from '@ant-design/icons';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Popover,
  Stack,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../../../@extended/components/Avatar/index.js';
import { getMeUrl } from '../../../../utilities/urlGenerator.js';
import { IconButton } from '../../../../@extended/components/IconButton/index.js';

export const BottomContent: React.FC = () => {
  const { t } = useTranslation();

  // Menu
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    window.location.href = getMeUrl();
  };

  return (
    <>
      <IconButton shape="rounded" color="secondary" onClick={handleMenuOpen}>
        <Stack
          direction="row"
          gap={1}
          sx={{ alignItems: 'center', width: '100%', justifyContent: 'center' }}
        >
          <Avatar size="sm" color="secondary" type="combined">
            <UserOutlined style={{ fontSize: 16 }} />
          </Avatar>
        </Stack>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 0,
          horizontal: 'left',
        }}
      >
        <List sx={{ width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleProfile}>
              <ListItemIcon>
                <UserOutlined />
              </ListItemIcon>
              {t('profile')}
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  );
};
