import { v4 } from 'uuid';
import { BypassPrismaType } from '../prisma/client.js';
import { enProject, jaProject } from './createProjects.js';

export const enAdminRole = v4();
export const enEditorRole = v4();
export const enGuestRole = v4();
export const jaAdminRole = v4();
export const jaEditorRole = v4();
export const jaGuestRole = v4();

export const createRoles = async (prisma: BypassPrismaType): Promise<void> => {
  await prisma.role.createMany({
    data: [
      // EN Project
      {
        id: enAdminRole,
        projectId: enProject,
        name: 'Administrator',
        description: 'Administrator role with all permissions.',
        isAdmin: true,
      },
      {
        id: enEditorRole,
        projectId: enProject,
        name: 'Editor',
        description: 'Editor role with permission to edit posts.',
      },
      {
        id: enGuestRole,
        projectId: enProject,
        name: 'Guest',
        description: 'Guest role with permission to view posts.',
      },
      // JA Project
      {
        id: jaAdminRole,
        projectId: jaProject,
        name: '管理者',
        description: 'すべての権限をもつ管理者ロール',
        isAdmin: true,
      },
      {
        id: jaEditorRole,
        projectId: jaProject,
        name: 'エディター',
        description: '投稿の編集権限をもつエディターロール',
      },
      {
        id: jaGuestRole,
        projectId: jaProject,
        name: 'ゲスト',
        description: '投稿の閲覧権限をもつゲストロール',
      },
    ],
  });
};
