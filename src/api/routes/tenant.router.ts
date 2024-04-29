import express from 'express';
import { content } from './content.router.js';
import { file } from './file.router.js';
import { me } from './me.router.js';
import { post } from './post.router.js';
import { project } from './project.router.js';
import { role } from './role.router.js';
import { user } from './user.router.js';

export const tenantApiRouter = express.Router();

tenantApiRouter.get('/health', (_req, res) => res.send('tenant ok'));
tenantApiRouter.use(user);
tenantApiRouter.use(role);
tenantApiRouter.use(project);
tenantApiRouter.use(me);
tenantApiRouter.use(file);
tenantApiRouter.use(post);
tenantApiRouter.use(content);
