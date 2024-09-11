import { ApiKey, Content, Project } from '@prisma/client';
import React, { createContext, useContext, useMemo } from 'react';
import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';
import { LocalizedContent, SourceLanguagePostItem, UploadFile } from '../../../../types/index.js';
import { api } from '../../../utilities/api.js';

type PostContext = {
  getPosts: () => SWRResponse<
    SourceLanguagePostItem[],
    Error,
    {
      suspense: true;
    }
  >;
  getContent: (id: string) => SWRResponse<
    LocalizedContent,
    Error,
    {
      suspense: true;
    }
  >;
  createPost: () => SWRMutationResponse<SourceLanguagePostItem, any, string>;
  trashPost: (postId: string) => SWRMutationResponse<void, any, string>;
  createContent: (postId: string) => SWRMutationResponse<Content, any, string, Record<string, any>>;
  trashLanguageContent: (
    postId: string,
    language: string
  ) => SWRMutationResponse<void, any, string>;
  updateContent: (contentId: string) => SWRMutationResponse<void, any, string, Record<string, any>>;
  trashContent: (contentId: string) => SWRMutationResponse<void, any, string>;
  translateContent: (
    contentId: string
  ) => SWRMutationResponse<{ title: string; body: string }, any, string, Record<string, any>>;
  requestReview: (contentId: string) => SWRMutationResponse<void, any, string, Record<string, any>>;
  publish: (contentId: string) => SWRMutationResponse<void, any, string, Record<string, any>>;
  archive: (contentId: string) => SWRMutationResponse<void, any, string, Record<string, any>>;
  createFileImage: () => SWRMutationResponse<
    { files: UploadFile[] },
    any,
    string,
    Record<string, any>
  >;
  getApiKeys: () => SWRMutationResponse<ApiKey[], Error>;
  getProject: () => SWRResponse<
    Project,
    Error,
    {
      suspense: true;
    }
  >;
};

const Context = createContext({} as PostContext);

export const PostContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getPosts = () =>
    useSWR(
      '/posts',
      (url) => api.get<{ posts: SourceLanguagePostItem[] }>(url).then((res) => res.data.posts),
      {
        suspense: true,
      }
    );

  const createPost = () =>
    useSWRMutation('/posts', async (url: string) => {
      return api.post<{ post: SourceLanguagePostItem }>(url).then((res) => res.data.post);
    });

  const trashPost = (postId: string) =>
    useSWRMutation(`/posts/${postId}/trash`, async (url: string) => {
      return api.delete(url).then((res) => res.data);
    });

  const getContent = (id: string) =>
    useSWR(
      `/contents/${id}`,
      (url) => api.get<{ content: LocalizedContent }>(url).then((res) => res.data.content),
      {
        suspense: true,
      }
    );

  const createContent = (postId: string) =>
    useSWRMutation(
      `/posts/${postId}/contents`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.post<{ content: Content }>(url, arg).then((res) => res.data.content);
      }
    );

  const trashLanguageContent = (postId: string, language: string) =>
    useSWRMutation(`/posts/${postId}/languages/${language}`, async (url: string) => {
      return api.delete(url).then((res) => res.data);
    });

  const translateContent = (postId: string) =>
    useSWRMutation(
      `/posts/${postId}/translate`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.post(url, arg).then((res) => res.data);
      }
    );

  const updateContent = (contentId: string) =>
    useSWRMutation(
      `/contents/${contentId}`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.patch(url, arg).then((res) => res.data);
      }
    );

  const trashContent = (contentId: string) =>
    useSWRMutation(`/contents/${contentId}/trash`, async (url: string) => {
      return api.delete(url).then((res) => res.data);
    });

  const requestReview = (contentId: string) =>
    useSWRMutation(
      `/contents/${contentId}/request-review`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.patch(url, arg).then((res) => res.data);
      }
    );

  const publish = (contentId: string) =>
    useSWRMutation(
      `/contents/${contentId}/publish`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.patch(url, arg).then((res) => res.data);
      }
    );

  const archive = (contentId: string) =>
    useSWRMutation(
      `/contents/${contentId}/archive`,
      async (url: string, { arg }: { arg: Record<string, any> }) => {
        return api.patch(url, arg).then((res) => res.data);
      }
    );

  const createFileImage = () =>
    useSWRMutation(`/files`, async (url: string, { arg }: { arg: Record<string, any> }) => {
      return api.post<{ files: UploadFile[] }>(url, arg).then((res) => res.data);
    });

  const getApiKeys = () =>
    useSWRMutation(`/api-keys`, async (url: string) => {
      return api.get<{ apiKeys: ApiKey[] }>(url).then((res) => res.data.apiKeys);
    });

  const getProject = () =>
    useSWR(
      '/projects',
      (url) => api.get<{ project: Project }>(url).then((res) => res.data.project),
      { suspense: true }
    );

  const value = useMemo(
    () => ({
      getPosts,
      createPost,
      trashPost,
      getContent,
      createContent,
      updateContent,
      trashContent,
      translateContent,
      trashLanguageContent,
      requestReview,
      publish,
      archive,
      createFileImage,
      getApiKeys,
      getProject,
    }),
    [
      getPosts,
      createPost,
      trashPost,
      getContent,
      createContent,
      updateContent,
      trashContent,
      translateContent,
      trashLanguageContent,
      requestReview,
      publish,
      archive,
      createFileImage,
      getApiKeys,
      getProject,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const usePost = () => useContext(Context);
