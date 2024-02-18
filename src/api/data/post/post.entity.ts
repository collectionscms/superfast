import { Post } from '@prisma/client';
import { v4 } from 'uuid';
import { LocalizedPost } from '../../../types/index.js';
import { ContentEntity } from '../content/content.entity.js';
import { UserEntity } from '../user/user.entity.js';

export class PostEntity {
  private readonly post: Post;

  constructor(post: Post) {
    this.post = post;
  }

  static Construct({
    projectId,
    defaultLocale,
    createdById,
  }: {
    projectId: string;
    defaultLocale: string;
    createdById: string;
  }): { post: PostEntity; content: ContentEntity } {
    const postId = v4();
    const post = new PostEntity({
      id: postId,
      projectId,
      slug: this.GenerateSlug(),
      status: 'init',
      publishedAt: null,
      defaultLocale,
      version: 0,
      createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const content = ContentEntity.Construct({ postId, locale: defaultLocale });

    return { post, content };
  }

  static Reconstruct(post: Post): PostEntity {
    return new PostEntity(post);
  }

  static GenerateSlug = () => {
    return v4().trim().replace(/-/g, '').substring(0, 10);
  };

  id(): string {
    return this.post.id;
  }

  defaultLocale(): string {
    return this.post.defaultLocale;
  }

  private copyProps(): Post {
    const copy = {
      ...this.post,
    };
    return Object.freeze(copy);
  }

  toPersistence(): Post {
    return this.copyProps();
  }

  toResponse(locale: string, contents: ContentEntity[], createdBy: UserEntity): LocalizedPost {
    const localizedContent = contents.find((content) => content.isSameLocaleContent(locale));
    const locales = contents.map((content) => content.locale());

    return {
      id: this.post.id,
      slug: this.post.slug,
      status: this.post.status,
      updatedAt: this.post.updatedAt,
      publishedAt: this.post.publishedAt,
      defaultLocale: this.post.defaultLocale,
      title: localizedContent?.title() ?? '',
      body: localizedContent?.body() ?? '',
      bodyJson: localizedContent?.bodyJson() ?? '',
      bodyHtml: localizedContent?.bodyHtml() ?? '',
      locales,
      authorName: createdBy.name(),
      contents: contents.map((content) => content.toPersistence()),
    };
  }
}
