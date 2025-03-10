import { Group, GroupItem } from '../components/elements/NavGroup/types.js';
import { useAuth } from '../components/utilities/Auth/index.js';

// /////////////////////////////////////
// Portal
// /////////////////////////////////////

export const profileNavItems = (): Group => {
  const path = '/admin';

  return {
    label: 'profile',
    items: [
      {
        label: 'profile',
        href: `${path}/me`,
        icon: 'UserRound',
      },
      {
        label: 'logout',
        href: `${path}/auth/logout`,
        icon: 'LogOut',
      },
    ],
  };
};

// /////////////////////////////////////
// Tenant
// /////////////////////////////////////

export const postNavItems = (): Group => {
  const { hasPermission } = useAuth();
  const path = '/admin';

  const items: GroupItem[] = [];

  if (hasPermission('readOwnPost') || hasPermission('readAllPost')) {
    items.push({
      label: 'posts',
      href: `${path}/posts`,
      icon: 'PencilLine',
    });
  }

  if (hasPermission('readOwnReview') || hasPermission('readAllReview')) {
    items.push({
      label: 'review',
      href: `${path}/reviews`,
      icon: 'Inbox',
    });
  }

  if (hasPermission('trashPost')) {
    items.push({
      label: 'trash',
      href: `${path}/trashed`,
      icon: 'Trash2',
    });
  }

  return {
    label: 'contents',
    items,
  };
};

export const settingsGroupNavItems = (): Group => {
  const { hasPermission } = useAuth();
  const path = '/admin/settings';

  const items: GroupItem[] = [];

  if (hasPermission('readProject')) {
    items.push({
      label: 'project_setting',
      href: `${path}/project/general`,
      icon: 'Settings',
    });
  }

  if (hasPermission('readRole')) {
    items.push({
      label: 'role',
      href: `${path}/roles`,
      icon: 'ShieldCheck',
    });
  }

  if (hasPermission('readUser')) {
    items.push({
      label: 'user',
      href: `${path}/users`,
      icon: 'UsersRound',
    });
  }

  if (hasPermission('readApiKey')) {
    items.push({
      label: 'api_key',
      href: `${path}/api-keys`,
      icon: 'KeyRound',
    });
  }

  if (hasPermission('readWebhookSetting')) {
    items.push({
      label: 'webhook',
      href: `${path}/webhooks`,
      icon: 'Webhook',
    });
  }

  return {
    label: 'setting',
    items,
  };
};

export const extensionsGroupNavItems = (): Group => {
  const path = '/admin';

  const items: GroupItem[] = [];

  items.push({
    label: 'template',
    href: `${path}/templates`,
    icon: 'LayoutTemplate',
  });

  return {
    label: 'extension',
    items,
  };
};
