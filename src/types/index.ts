import {
  Alumnus,
  ApiKey,
  Award,
  Content,
  ContentRevision,
  Experience,
  File,
  Permission,
  Project,
  Review,
  Role,
  SocialProfile,
  SpokenLanguage,
  Tag,
  User,
} from '@prisma/client';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isRegistered: boolean;
  role: Role;
  updatedAt: Date;
};

export type ProjectRole = {
  project: Project;
  role: Role;
  permissions: Permission[];
};

export type Me = {
  id: string;
  email: string;
};

export type AuthorProfile = {
  user: User;
  socialProfiles: SocialProfile[];
  alumni: Alumnus[];
  spokenLanguages: SpokenLanguage[];
  awards: Award[];
  experiences: Experience[];
};

export type ApiError = {
  status: number;
  code: string;
  extensions?: {
    message?: string;
  };
};

export type StatusHistory = {
  currentStatus: string;
  prevStatus: string | null;
  isReviewing: boolean;
  isPublished: boolean;
};

export type LocalizedContentItem = {
  postId: string;
  contentId: string;
  title: string;
  slug: string;
  status: StatusHistory;
  language: string;
  updatedByName: string;
  updatedAt: Date;
};

export type SourceLanguagePostItem = LocalizedContentItem & {
  localizedContents: LocalizedContentItem[];
};

export type RevisedContent = {
  id: string;
  postId: string;
  slug: string;
  status: StatusHistory;
  updatedAt: Date;
  version: number;
  title: string;
  subtitle: string | null;
  body: string;
  bodyJson: string;
  bodyHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  coverUrl: string | null;
  language: string;
  languageContents: { contentId: string; language: string }[];
  canTranslate: boolean;
  sourceLanguageCode: string | null;
  targetLanguageCode: string | null;
  draftKey: string | null;
  revisions: ContentRevision[];
  tags: Tag[];
};

export type PublishedListContent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string;
  bodyHtml: string;
  status: string;
  language: string;
  version: number;
  coverUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    bioUrl: string | null;
    employer: string | null;
    jobTitle: string | null;
  };
};

export type PublishedContent = {
  author: {
    spokenLanguages: {
      language: string;
    }[];
    awards: {
      name: string;
    }[];
    socialProfiles: {
      provider: string;
      url: string | null;
    }[];
    alumni: {
      name: string;
      url: string | null;
    }[];
    experiences: {
      name: string;
      url: string | null;
      resources: {
        url: string | null;
      }[];
    }[];
  };
  tags: {
    id: string;
    name: string;
  }[];
} & PublishedListContent;

export type PublishedPost = {
  id: string;
  contents: PublishedListContent[];
};

export type UploadFile = {
  url: string;
} & File;

export type ApiKeyWithPermissions = {
  permissions: string[];
} & ApiKey;

export type RoleWithPermissions = {
  permissions: string[];
} & Role;

export type ProjectWithRole = Project & {
  isAdmin: boolean;
  permissions: {
    action: string;
  }[];
};

export type ProjectWithExperiences = Project & {
  experiences: Experience[];
};

export type ReviewWithContentAndParticipant = Review & {
  content: Content;
  revieweeName: string;
  reviewerName: string | null;
};

export type ExperienceWithResourceUrl = Experience & {
  resourceUrls: string[];
};
