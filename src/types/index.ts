import { ApiKey, ContentHistory, File, Permission, Project, Role } from '@prisma/client';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isRegistered: boolean;
  role: Role;
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

export type ApiError = {
  status: number;
  code: string;
  extensions?: {
    message?: string;
  };
};

export type PostItem = {
  id: string;
  contentId: string;
  title: string;
  slug: string;
  languageStatues: { language: string; currentStatus: string; prevStatus?: string }[];
  updatedByName: string;
  updatedAt: Date;
};

export type LocalizedPost = {
  id: string;
  slug: string;
  contentId: string;
  currentStatus: string;
  prevStatus?: string;
  updatedAt: Date;
  contentLanguage: string;
  version: number;
  title: string;
  body: string;
  bodyJson: string;
  bodyHtml: string;
  languages: string[];
  file: UploadFile | null;
  histories: ContentHistory[];
};

export type PublishedContent = {
  title: string;
  body: string;
  bodyHtml: string;
  language: string;
  version: number;
  coverUrl: string | null;
};

export type PublishedPost = {
  id: string;
  slug: string;
  contents: {
    [language: string]: PublishedContent;
  };
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
