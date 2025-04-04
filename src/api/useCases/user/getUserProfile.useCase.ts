import { RecordNotFoundException } from '../../../exceptions/database/recordNotFound.js';
import { UserProfile } from '../../../types/index.js';
import { ProjectPrismaType } from '../../database/prisma/client.js';
import { UserRepository } from '../../persistence/user/user.repository.js';

export class GetUserProfileUseCase {
  constructor(
    private readonly prisma: ProjectPrismaType,
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const userRole = await this.userRepository.findOneWithUserRole(this.prisma, userId);
    if (!userRole) {
      throw new RecordNotFoundException('record_not_found');
    }

    return {
      id: userRole.user.id,
      name: userRole.user.name,
      email: userRole.user.email,
      isActive: userRole.user.isActive,
      isRegistered: true,
      role: userRole.role.toResponse(),
      updatedAt: userRole.user.updatedAt,
    };
  }
}
