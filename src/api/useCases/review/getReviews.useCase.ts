import { ReviewWithParticipant } from '../../../types/index.js';
import { ProjectPrismaType } from '../../database/prisma/client.js';
import { ReviewRepository } from '../../persistence/review/review.repository.js';
import { GetReviewsUseCaseSchemaType } from './getReviews.useCase.schema.js';

export class GetReviewsUseCase {
  constructor(
    private readonly prisma: ProjectPrismaType,
    private readonly reviewRepository: ReviewRepository
  ) {}

  async execute(
    props: GetReviewsUseCaseSchemaType,
    hasReadAllReview: boolean
  ): Promise<ReviewWithParticipant[]> {
    const records = hasReadAllReview
      ? await this.reviewRepository.findManyWithUser(this.prisma)
      : await this.reviewRepository.findOwnManyWithUser(this.prisma, props.userId);

    return records.map((record) => ({
      ...record.review.toResponse(),
      revieweeName: record.reviewee.name,
      reviewerName: record.reviewer?.name ?? null,
    }));
  }
}
