import crypto from 'crypto';
import express, { Request, Response } from 'express';
import { env } from '../../env.js';
import { RecordNotFoundException } from '../../exceptions/database/recordNotFound.js';
import { InvalidCredentialsException } from '../../exceptions/invalidCredentials.js';
import { UnprocessableEntityException } from '../../exceptions/unprocessableEntity.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { permissionsHandler } from '../middleware/permissionsHandler.js';
import { MailService } from '../services/mail.js';
import { ProjectSettingsService } from '../services/projectSettings.js';
import { UsersService } from '../services/users.js';
import { oneWayHash } from '../utilities/oneWayHash.js';

const router = express.Router();

router.get(
  '/users',
  permissionsHandler([{ collection: 'superfast_users', action: 'read' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const service = new UsersService({ schema: req.schema });
    const users = await service.readWithRole();

    res.json({
      users: users.flatMap(({ ...user }) => payload(user)),
    });
  })
);

router.get(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'read' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const service = new UsersService({ schema: req.schema });
    const user = await service.readWithRole(id).then((users) => users[0]);

    if (!user) throw new RecordNotFoundException('record_not_found');

    res.json({
      user: payload(user),
    });
  })
);

router.post(
  '/users',
  permissionsHandler([{ collection: 'superfast_users', action: 'create' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const service = new UsersService({ schema: req.schema });
    await service.checkUniqueEmail(req.body.email);

    const hashed = await oneWayHash(req.body.password);
    const userId = await service.createOne({
      ...req.body,
      password: hashed,
    });

    res.json({
      id: userId,
    });
  })
);

router.patch(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'update' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const service = new UsersService({ schema: req.schema });
    await service.checkUniqueEmail(req.body.email, id);

    const data = req.body.password
      ? { ...req.body, password: await oneWayHash(req.body.password) }
      : req.body;

    await service.updateOne(id, data);

    res.status(204).end();
  })
);

router.delete(
  '/users/:id',
  permissionsHandler([{ collection: 'superfast_users', action: 'delete' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (req.userId === id) {
      throw new UnprocessableEntityException('can_not_delete_itself');
    }

    const service = new UsersService({ schema: req.schema });
    await service.deleteOne(id);

    res.status(204).end();
  })
);

router.post(
  '/users/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.body.token;
    const password = req.body.password;

    const service = new UsersService({ schema: req.schema });
    const users = await service.readMany({
      filter: {
        _and: [
          { reset_password_token: { _eq: token } },
          { reset_password_expiration: { _gt: Date.now() } },
        ],
      },
    });

    if (users.length === 0) {
      throw new InvalidCredentialsException('token_invalid_or_expired');
    }

    await service.updateOne(users[0].id, {
      password: await oneWayHash(password),
      reset_password_expiration: Date.now(),
    });

    res.json({
      message: 'success',
    });
  })
);

router.post(
  '/users/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const service = new UsersService({ schema: req.schema });
    const user = await service
      .readMany({
        filter: { email: { _eq: req.body.email } },
      })
      .then((users) => users[0]);

    if (!user) {
      throw new InvalidCredentialsException('unregistered_email_address');
    }

    let token: string | Buffer = crypto.randomBytes(20);
    token = token.toString('hex');

    user.reset_password_token = token;
    user.reset_password_expiration = Date.now() + 3600000; // 1 hour

    await service.updateOne(user.id, user);

    const projectSettingsService = new ProjectSettingsService({ schema: req.schema });
    const projectSettings = await projectSettingsService.readMany();
    const projectName = projectSettings[0].name;

    const mail = new MailService();
    mail.sendEmail(projectName, {
      to: user.email,
      subject: 'Reset Password',
      html: `${env.PUBLIC_SERVER_URL}/admin/auth/reset-password/${user.reset_password_token}`,
    });

    res.json({
      message: 'success',
    });
  })
);

const payload = (user: any) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.is_active,
    api_key: user.api_key ? '********' : null,
    updated_at: user.updated_at,
    role: {
      id: user.role_id,
      name: user.role_name,
      description: user.role_description,
      admin_access: user.role_admin_access,
    },
  };
};

export const users = router;
