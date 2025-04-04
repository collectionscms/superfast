import { WebhookSetting } from '@prisma/client';
import { v4 } from 'uuid';
import { UnexpectedException } from '../../../exceptions/unexpected.js';
import { PrismaBaseEntity } from '../prismaBaseEntity.js';
import { WebhookTriggerEvent } from '../webhookLog/webhookLog.entity.js';

export const WebhookProvider = {
  vercel: 'vercel',
  custom: 'custom',
} as const;
export type WebhookProvider = (typeof WebhookProvider)[keyof typeof WebhookProvider];

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
      onPublish: props.onPublish,
      onArchive: props.onArchive,
      onDeletePublished: props.onDeletePublished,
      onRestorePublished: props.onRestorePublished,
      onRevert: props.onRevert,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id() {
    return this.props.id;
  }

  get url() {
    return this.props.url;
  }

  get name() {
    return this.props.name;
  }

  get provider() {
    return this.props.provider;
  }

  get enabled() {
    return this.props.enabled;
  }

  canSend(triggerEvent: WebhookTriggerEvent): boolean {
    if (!this.props.enabled) return false;

    switch (triggerEvent) {
      case WebhookTriggerEvent.publish:
        return this.props.onPublish;
      case WebhookTriggerEvent.archive:
        return this.props.onArchive;
      case WebhookTriggerEvent.trashPublished:
        return this.props.onDeletePublished;
      case WebhookTriggerEvent.restorePublished:
        return this.props.onRestorePublished;
      case WebhookTriggerEvent.revert:
        return this.props.onRevert;
      default:
        return false;
    }
  }

  update = (params: {
    name: string;
    url: string | null;
    enabled: boolean;
    onPublish: boolean;
    onArchive: boolean;
    onDeletePublished: boolean;
    onRestorePublished: boolean;
    onRevert: boolean;
  }) => {
    this.props.name = params.name;
    this.props.url = params.url;
    this.props.enabled = params.enabled;
    this.props.onPublish = params.onPublish;
    this.props.onArchive = params.onArchive;
    this.props.onDeletePublished = params.onDeletePublished;
    this.props.onRestorePublished = params.onRestorePublished;
    this.props.onRevert = params.onRevert;
  };

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
