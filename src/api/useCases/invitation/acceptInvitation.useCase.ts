import { Permission, Project, Role } from '@prisma/client';
import { RecordNotFoundException } from '../../../exceptions/database/recordNotFound.js';
import { InvalidTokenException } from '../../../exceptions/invalidToken.js';
import { InvitationRepository } from '../../persistence/invitation/invitation.repository.js';
import { UserProjectEntity } from '../../persistence/userProject/userProject.entity.js';
import { UserProjectRepository } from '../../persistence/userProject/userProject.repository.js';
import { BypassPrismaType, projectPrisma } from '../../database/prisma/client.js';
import { AcceptInvitationUseCaseSchemaType } from './acceptInvitation.useCase.schema.js';

export type AcceptInvitationUseCaseResponse = {
  project: Project;
  role: Role;
  permissions: Permission[];
};

export class AcceptInvitationUseCase {
  constructor(
    private readonly prisma: BypassPrismaType,
    private readonly userProjectRepository: UserProjectRepository,
    private readonly invitationRepository: InvitationRepository
  ) {}

  async execute(
    props: AcceptInvitationUseCaseSchemaType
  ): Promise<AcceptInvitationUseCaseResponse> {
    const { inviteToken, userId, email } = props;

    const invitation = await this.invitationRepository.findOneByToken(this.prisma, inviteToken);
    if (invitation.email !== email || invitation.isAccepted()) {
      throw new InvalidTokenException();
    }

    const entity = UserProjectEntity.Construct({
      userId: userId,
      projectId: invitation.projectId,
      roleId: invitation.roleId,
    });

    const projectRole = await projectPrisma(invitation.projectId).$transaction(async (tx) => {
      await this.userProjectRepository.create(tx, entity);

      invitation.acceptInvitation();
      await this.invitationRepository.updateStatus(tx, invitation);

      const projectRole = await this.userProjectRepository.findOneWithRoleByUserId(tx, userId);
      if (!projectRole) {
        throw new RecordNotFoundException('record_not_found');
      }

      return projectRole;
    });

    return {
      project: projectRole.project.toPersistence(),
      role: projectRole.role.toPersistence(),
      permissions: projectRole.permissions.map((permission) => permission.toPersistence()),
    };
  }
}
