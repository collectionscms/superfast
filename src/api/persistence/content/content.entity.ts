import { Content } from '@prisma/client';
import { v4 } from 'uuid';
import { getLanguageCodeType, LanguageCode } from '../../../constants/languages.js';
import { RecordNotFoundException } from '../../../exceptions/database/recordNotFound.js';
import { UnexpectedException } from '../../../exceptions/unexpected.js';
import { LocalizedContent, PublishedContent, UsedLanguage } from '../../../types/index.js';
import { ContentHistoryEntity } from '../contentHistory/contentHistory.entity.js';
import { PrismaBaseEntity } from '../prismaBaseEntity.js';
import { ProjectEntity } from '../project/project.entity.js';
import { UserEntity } from '../user/user.entity.js';

export const ContentStatus = {
  draft: 'draft',
  review: 'review',
  published: 'published',
  archived: 'archived',
} as const;
export type ContentStatusType = (typeof ContentStatus)[keyof typeof ContentStatus];

type ContentProps = Omit<
  Content,
  | 'id'
  | 'coverUrl'
  | 'title'
  | 'body'
  | 'bodyJson'
  | 'bodyHtml'
  | 'version'
  | 'status'
  | 'updatedById'
  | 'publishedAt'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
> & {
  coverUrl?: string | null;
  title?: string | null;
  body?: string | null;
  bodyJson?: string | null;
  bodyHtml?: string | null;
  version?: number;
};

export class ContentEntity extends PrismaBaseEntity<Content> {
  static Construct(props: ContentProps): ContentEntity {
    const now = new Date();
    return new ContentEntity({
      id: v4(),
      projectId: props.projectId,
      postId: props.postId,
      slug: props.slug,
      coverUrl: props.coverUrl ?? null,
      title: props.title ?? null,
      body: props.body ?? null,
      bodyJson: props.bodyJson ?? null,
      bodyHtml: props.bodyHtml ?? null,
      language: props.language,
      status: ContentStatus.draft,
      publishedAt: null,
      version: props.version ?? 1,
      createdById: props.createdById,
      updatedById: props.createdById,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private isValid() {
    if (!this.props.id) {
      throw new UnexpectedException({ message: 'id is required' });
    }
  }

  public beforeUpdateValidate(): void {
    this.isValid();

    if (!encodeURIComponent(this.props.slug)) {
      throw new UnexpectedException({ message: 'Invalid slug format' });
    }
  }

  public beforeInsertValidate(): void {
    this.isValid();

    if (!encodeURIComponent(this.props.slug)) {
      throw new UnexpectedException({ message: 'Invalid slug format' });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get postId(): string {
    return this.props.postId;
  }

  get slug(): string {
    return this.props.slug;
  }

  get title(): string {
    return this.props.title ?? '';
  }

  get body(): string {
    return this.props.body ?? '';
  }

  get bodyJson(): string {
    return this.props.bodyJson ?? '';
  }

  get bodyHtml(): string {
    return this.props.bodyHtml ?? '';
  }

  get coverUrl(): string {
    return this.props.coverUrl ?? '';
  }

  get language(): string {
    return this.props.language;
  }

  get status(): string {
    return this.props.status;
  }

  get publishedAt(): Date | null {
    return this.props.publishedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get version(): number {
    return this.props.version;
  }

  get createdById(): string {
    return this.props.createdById;
  }

  get updatedById(): string {
    return this.props.updatedById;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get languageCode(): LanguageCode | null {
    return getLanguageCodeType(this.language);
  }

  static generateSlug = () => {
    return v4().trim().replace(/-/g, '').substring(0, 10);
  };

  static usedLanguages(contents: ContentEntity[]): UsedLanguage[] {
    const latestVerContents = contents.filter(
      (c) =>
        !contents.some(
          (cc) => c.props.language === cc.props.language && c.props.version < cc.props.version
        )
    );

    return latestVerContents.map((c) => ({
      contentId: c.props.id,
      language: c.props.language,
    }));
  }

  changeStatus({ status, updatedById }: { status: string; updatedById?: string }) {
    this.props.status = status;

    if (updatedById) {
      this.props.updatedById = updatedById;
    }
  }

  delete(userId: string) {
    this.props.deletedAt = new Date();
    this.props.updatedById = userId;
  }

  restore(userId: string) {
    this.props.deletedAt = null;
    this.props.updatedById = userId;
  }

  hasNewVersion(contents: ContentEntity[]): boolean {
    return contents.some(
      (c) => c.props.language === this.props.language && c.props.version > this.props.version
    );
  }

  isPublished(): boolean {
    return this.props.status === ContentStatus.published;
  }

  updateContent({
    title,
    body,
    bodyJson,
    bodyHtml,
    coverUrl,
    slug,
    updatedById,
  }: {
    title?: string | null;
    body?: string | null;
    bodyJson?: string | null;
    bodyHtml?: string | null;
    coverUrl?: string | null;
    slug?: string;
    updatedById: string;
  }): void {
    Object.assign(this.props, {
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(bodyJson !== undefined && { bodyJson }),
      ...(bodyHtml !== undefined && { bodyHtml }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(slug !== undefined && { slug: encodeURIComponent(slug) }),
      updatedById,
    });
  }

  isSameLanguageContent(language: string) {
    return this.props.language.toLocaleLowerCase() === language.toLocaleLowerCase();
  }

  /**
   * Convert entity to content response
   * @param project
   * @param usedLanguages
   * @param content
   * @param createdBy
   * @param updatedBy
   * @param histories
   * @returns
   */
  toLocalizedContentResponse(
    project: ProjectEntity,
    usedLanguages: UsedLanguage[],
    createdBy: UserEntity,
    updatedBy: UserEntity,
    histories: ContentHistoryEntity[]
  ): LocalizedContent {
    return {
      contentId: this.props.id,
      postId: this.props.postId,
      title: this.props.title ?? '',
      body: this.props.body ?? '',
      bodyJson: this.props.bodyJson ?? '',
      bodyHtml: this.props.bodyHtml ?? '',
      slug: this.props.slug,
      status: {
        prevStatus:
          this.props.version > 1 && this.props.status !== ContentStatus.published
            ? ContentStatus.published
            : null,
        currentStatus: this.props.status,
      },
      version: this.props.version,
      coverUrl: this.props.coverUrl ?? '',
      language: this.props.language,
      updatedAt: this.props.updatedAt,
      createdByName: createdBy.name,
      updatedByName: updatedBy.name,
      usedLanguages,
      canTranslate:
        project.isTranslationEnabled(this.props.language) &&
        usedLanguages.some((ul) => ul.language === project.sourceLanguage),
      sourceLanguageCode: project.sourceLanguageCode?.code ?? null,
      targetLanguageCode: this.languageCode?.code ?? null,
      histories: histories.map((history) => history.toResponse()),
    };
  }

  /**
   * Convert entity to published content response
   * @param content
   * @param createdBy
   * @returns
   */
  toPublishedContentResponse(createdBy: UserEntity): PublishedContent {
    if (!this.props.publishedAt) {
      throw new RecordNotFoundException('record_not_found');
    }

    return {
      slug: this.props.slug,
      title: this.props.title ?? '',
      body: this.props.body ?? '',
      bodyHtml: this.props.bodyHtml ?? '',
      language: this.props.language,
      version: this.props.version,
      coverUrl: this.props.coverUrl,
      publishedAt: this.props.publishedAt,
      author: {
        id: createdBy.id,
        name: createdBy.name,
        avatarUrl: createdBy.avatarUrl,
      },
    };
  }
}
