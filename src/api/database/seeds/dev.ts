import { Output } from '../../../utilities/output.js';
import { status } from '../../data/post/post.entity.js';
import { bypassPrisma } from '../prisma/client.js';
import { createPermissions } from './createPermissions.js';
import { createPost } from './createPost.js';
import { createProjects, enProject, jaProject } from './createProjects.js';
import {
  createRoles,
  enAdminRole,
  enContributorRole,
  enEditorRole,
  enViewerRole,
  jaAdminRole,
  jaContributorRole,
  jaEditorRole,
  jaViewerRole,
} from './createRoles.js';
import { adminUser, contributorUser, createUsers, editorUser, viewerUser } from './createUsers.js';

export const seedDev = async (): Promise<void> => {
  try {
    await bypassPrisma.$transaction(async (tx) => {
      await createProjects(tx);
      await createPermissions(tx);
      await createRoles(tx);
      await createUsers(tx, getUsers());

      for (const project of [enProject, jaProject]) {
        // draft
        await createPost(tx, project, {
          status: status.draft,
          locale: project === enProject ? 'en' : 'ja',
        });

        // review
        await createPost(tx, project, {
          status: status.review,
          locale: project === enProject ? 'en' : 'ja',
        });

        // published
        await createPost(tx, project, {
          status: status.published,
          locale: project === enProject ? 'en' : 'ja',
        });

        // archived
        await createPost(tx, project, {
          status: status.archived,
          locale: project === enProject ? 'en' : 'ja',
        });
      }
    });

    process.exit(0);
  } catch (e) {
    Output.error(e);
    process.exit(1);
  }
};

function getUsers() {
  const users = [
    {
      id: adminUser,
      email: 'admin@collections.dev',
      password: 'password',
      userProjects: [
        {
          projectId: enProject,
          roleId: enAdminRole,
        },
        {
          projectId: jaProject,
          roleId: jaAdminRole,
        },
      ],
    },
    {
      id: editorUser,
      email: 'editor@collections.dev',
      password: 'password',
      userProjects: [
        {
          projectId: enProject,
          roleId: enEditorRole,
        },
        {
          projectId: jaProject,
          roleId: jaEditorRole,
        },
      ],
    },
    {
      id: contributorUser,
      email: 'contributor@collections.dev',
      password: 'password',
      userProjects: [
        {
          projectId: enProject,
          roleId: enContributorRole,
        },
        {
          projectId: jaProject,
          roleId: jaContributorRole,
        },
      ],
    },
    {
      id: viewerUser,
      email: 'viewer@collections.dev',
      password: 'password',
      userProjects: [
        {
          projectId: enProject,
          roleId: enViewerRole,
        },
        {
          projectId: jaProject,
          roleId: jaViewerRole,
        },
      ],
    },
  ];

  return users;
}
