import { SourceLanguagePostItem } from '../../../types/index.js';
import { ProjectPrismaClient } from '../../database/prisma/client.js';
import { ContentRepository } from '../../persistence/content/content.repository.js';
import { ContentHistoryEntity } from '../../persistence/contentHistory/contentHistory.entity.js';
import { ContentHistoryRepository } from '../../persistence/contentHistory/contentHistory.repository.js';
import { PostEntity } from '../../persistence/post/post.entity.js';
import { PostRepository } from '../../persistence/post/post.repository.js';
import { ProjectRepository } from '../../persistence/project/project.repository.js';
import { CreatePostUseCaseSchemaType } from './createPost.schema.js';

export class CreatePostUseCase {
  constructor(
    private readonly prisma: ProjectPrismaClient,
    private readonly projectRepository: ProjectRepository,
    private readonly postRepository: PostRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentHistoryRepository: ContentHistoryRepository
  ) {}

  async execute(props: CreatePostUseCaseSchemaType): Promise<SourceLanguagePostItem> {
    const { userId, projectId, sourceLanguage } = props;

    const project = await this.projectRepository.findOneById(this.prisma, props.projectId);

    const { post, content } = PostEntity.Construct({
      projectId: projectId,
      language: sourceLanguage,
      createdById: userId,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const createdPost = await this.postRepository.create(tx, post);
      const { content: createdContent, createdBy } = await this.contentRepository.create(
        tx,
        content
      );

      const contentHistory = ContentHistoryEntity.Construct({
        ...createdContent.toResponse(),
      });
      await this.contentHistoryRepository.create(tx, contentHistory);

      return {
        post: createdPost,
        contents: [
          {
            content: createdContent,
            file: null,
            createdBy: createdBy,
            histories: [contentHistory],
          },
        ],
      };
    });

    return result.post.toSourceLanguagePostItemResponse(project.sourceLanguage, [
      { content: result.contents[0].content, updatedBy: result.contents[0].createdBy },
    ]);
  }
}
