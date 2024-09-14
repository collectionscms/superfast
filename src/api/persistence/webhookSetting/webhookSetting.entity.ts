import { WebhookSetting } from '@prisma/client';
import { v4 } from 'uuid';
import { UnexpectedException } from '../../../exceptions/unexpected.js';
import { PrismaBaseEntity } from '../prismaBaseEntity.js';

export const WebhookProvider = {
  vercel: 'vercel',
  custom: 'custom',
} as const;
export type WebhookProviderType = (typeof WebhookProvider)[keyof typeof WebhookProvider];

export type WebhookSettingProps = Omit<WebhookSetting, 'id' | 'createdAt' | 'updatedAt'>;

export class WebhookSettingEntity extends PrismaBaseEntity<WebhookSetting> {
  static Construct(props: WebhookSettingProps): WebhookSettingEntity {
    const now = new Date();
    return new WebhookSettingEntity({
      id: v4(),
      projectId: props.projectId,
      name: props.name,
      enabled: props.enabled,
      provider: props.provider,
      url: props.url,
      secret: props.secret,
      requestHeaders: props.requestHeaders,
      onPublish: props.onPublish,
      onArchive: props.onArchive,
      onDeletePublished: props.onDeletePublished,
      createdAt: now,
      updatedAt: now,
    });
  }

  get requestHeaders() {
    return this.props.requestHeaders ?? {};
  }

  private isValid() {
    if (!this.props.id) {
      throw new UnexpectedException({ message: 'id is required' });
    }
  }

  public beforeUpdateValidate(): void {
    this.isValid();
  }

  public beforeInsertValidate(): void {
    this.isValid();
  }
}
