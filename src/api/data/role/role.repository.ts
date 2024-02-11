import { Role, UserProject } from '@prisma/client';
import { RecordNotFoundException } from '../../../exceptions/database/recordNotFound.js';
import { UnprocessableEntityException } from '../../../exceptions/unprocessableEntity.js';
import { prismaType } from '../../database/prisma/client';
import { RoleEntity } from './role.entity.js';

export class RoleRepository {
  async findRoles(prisma: prismaType): Promise<Role[]> {
    return await prisma.role.findMany();
  }

  async findRole(prisma: prismaType, id: string): Promise<Role & { userProjects: UserProject[] }> {
    return await prisma.role.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        userProjects: true,
      },
    });
  }

  async create(prisma: prismaType, entity: RoleEntity): Promise<RoleEntity> {
    const record = await prisma.role.create({
      data: entity.toPersistence(),
    });
    return RoleEntity.Reconstruct(record);
  }

  async update(prisma: prismaType, id: string, entity: RoleEntity): Promise<RoleEntity> {
    const record = entity.toPersistence();
    const result = await prisma.role.update({
      where: {
        id,
      },
      data: {
        name: record.name,
        description: record.description,
      },
    });
    return RoleEntity.Reconstruct(result);
  }

  async delete(prisma: prismaType, id: string): Promise<void> {
    const role = await this.findRole(prisma, id);
    if (!role) throw new RecordNotFoundException('record_not_found');
    if (role.userProjects) new UnprocessableEntityException('can_not_delete_role_in_use');

    await prisma.role.delete({
      where: {
        id,
      },
    });
  }
}
