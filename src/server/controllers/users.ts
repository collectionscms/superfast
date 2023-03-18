import express, { Request, Response } from 'express';
import { InvalidCredentialsException } from '../../shared/exceptions/invalidCredentials';
import { UnprocessableEntityException } from '../../shared/exceptions/unprocessableEntity';
import { User } from '../../shared/types';
import { getDatabase } from '../database/connection';
import asyncHandler from '../middleware/asyncHandler';
import permissionsHandler from '../middleware/permissionsHandler';
import { oneWayHash } from '../utilities/oneWayHash';

const app = express();

app.get(
  '/users',
  permissionsHandler([{ collection: 'superfast_users', action: 'read' }]),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new InvalidCredentialsException('invalid_user_credentials');
    }

    const database = getDatabase();
    const users = await database
      .select('u.*', {
        roleId: 'r.id',
        roleName: 'r.name',
        roleDescription: 'r.description',
        roleAdminAccess: 'r.admin_access',
      })
      .from('superfast_users AS u')
      .join('superfast_roles AS r', 'r.id', 'u.role_id');

    res.json({
      users: users.flatMap(({ password, ...user }) => payload(user)),
    });
  })
);

app.get(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'read' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const database = getDatabase();
    const id = req.params.id;

    const user = await database
      .select('u.*', {
        roleId: 'r.id',
        roleName: 'r.name',
        roleDescription: 'r.description',
        roleAdminAccess: 'r.admin_access',
      })
      .from('superfast_users AS u')
      .join('superfast_roles AS r', 'r.id', 'u.role_id')
      .where('u.id', id)
      .first();

    if (!user) return res.status(400).end();

    res.json({
      user: payload(user),
    });
  })
);

app.post(
  '/users',
  permissionsHandler([{ collection: 'superfast_users', action: 'create' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const database = getDatabase();
    req.body.password = await oneWayHash(req.body.password);

    const users = await database<User>('superfast_users').insert(req.body, 'id');

    res.json({
      user: users[0],
    });
  })
);

app.patch(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'update' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const database = getDatabase();
    const id = Number(req.params.id);

    if (req.body.password) {
      req.body.password = await oneWayHash(req.body.password);
    }

    await database('superfast_users').where('id', id).update(req.body);

    res.status(204).end();
  })
);

app.delete(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'delete' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const database = getDatabase();
    const id = Number(req.params.id);

    if (!req.userId) {
      throw new InvalidCredentialsException('invalid_user_credentials');
    }

    if (req.userId === id) {
      throw new UnprocessableEntityException('can_not_delete_itself');
    }

    await database('superfast_users').where('id', id).delete();

    res.status(204).end();
  })
);

const payload = (user: any) => {
  return {
    id: user.id,
    lastName: user.lastName,
    firstName: user.firstName,
    userName: user.userName,
    email: user.email,
    isActive: user.isActive,
    apiKey: user.apiKey,
    updatedAt: user.updatedAt,
    role: {
      id: user.roleId,
      name: user.roleName,
      description: user.roleDescription,
      adminAccess: user.roleAdminAccess,
    },
  };
};

export default app;
