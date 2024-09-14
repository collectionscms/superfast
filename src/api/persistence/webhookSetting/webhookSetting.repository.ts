import { WebhookSetting } from '@prisma/client';
import { ProjectPrismaType } from '../../database/prisma/client.js';
import { WebhookSettingEntity } from './webhookSetting.entity.js';

export class WebhookSettingRepository {
  async findMany(prisma: ProjectPrismaType): Promise<WebhookSettingEntity[]> {
    const records = await prisma.webhookSetting.findMany();
    return records.map((record) =>
      WebhookSettingEntity.Reconstruct<WebhookSetting, WebhookSettingEntity>(record)
    );
  }

  async findOne(prisma: ProjectPrismaType, id: string): Promise<WebhookSettingEntity> {
    const record = await prisma.webhookSetting.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return WebhookSettingEntity.Reconstruct<WebhookSetting, WebhookSettingEntity>(record);
  }

  async create(
    prisma: ProjectPrismaType,
    entity: WebhookSettingEntity
  ): Promise<WebhookSettingEntity> {
    entity.beforeInsertValidate();

    const result = await prisma.webhookSetting.create({
      data: {
        ...entity.toPersistence(),
        requestHeaders: entity.requestHeaders,
      },
    });
    return WebhookSettingEntity.Reconstruct<WebhookSetting, WebhookSettingEntity>(result);
  }

  async update(
    prisma: ProjectPrismaType,
    entity: WebhookSettingEntity
  ): Promise<WebhookSettingEntity> {
    entity.beforeUpdateValidate();

    const record = entity.toPersistence();
    const result = await prisma.webhookSetting.update({
      where: {
        id: entity.id,
      },
      data: {
        name: record.name,
        url: record.url,
        enabled: record.enabled,
        onPublish: record.onPublish,
        onArchive: record.onArchive,
        onDeletePublished: record.onDeletePublished,
      },
    });
    return WebhookSettingEntity.Reconstruct<WebhookSetting, WebhookSettingEntity>(result);
  }
}
