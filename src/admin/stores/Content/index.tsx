import { Collection, Field } from '@shared/types';
import axios from 'axios';
import React, { createContext, useContext } from 'react';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

type ContextType = {
  getContents: (slug: string, config?: SWRConfiguration) => SWRResponse<any[]>;
  getFields: (slug: string, config?: SWRConfiguration) => SWRResponse<Field[]>;
  createContent: (slug: string) => SWRMutationResponse<unknown>;
  updateContent: (slug: string, id: string) => SWRMutationResponse<unknown>;
};

const Context = createContext<ContextType>({} as any);

export const ContentContextProvider = ({ children }) => {
  const getContents = (slug: string, config?: SWRConfiguration): SWRResponse =>
    useSWR(
      `/api/collections/${slug}/contents`,
      (url) =>
        axios
          .get<{ contents: unknown[] }>(url)
          .then((res) => res.data.contents)
          .catch((err) => Promise.reject(err.message)),
      config
    );

  const getFields = (slug: string, config?: SWRConfiguration): SWRResponse =>
    useSWR(
      `/api/collections/${slug}/fields`,
      (url) =>
        axios
          .get<{ fields: Field[] }>(url)
          .then((res) => res.data.fields)
          .catch((err) => Promise.reject(err.message)),
      config
    );

  const createContent = (slug: string): SWRMutationResponse =>
    useSWRMutation(`/api/collections/${slug}/contents`, async (url: string, { arg }) => {
      return axios
        .post<{ content: unknown }>(url, arg)
        .then((res) => res.data.content)
        .catch((err) => Promise.reject(err.message));
    });

  const updateContent = (slug: string, id: string): SWRMutationResponse =>
    useSWRMutation(`/api/collections/${slug}/contents/${id}`, async (url: string, { arg }) => {
      return axios
        .patch<{ content: unknown }>(url, arg)
        .then((res) => res.data)
        .catch((err) => Promise.reject(err.message));
    });

  return (
    <Context.Provider
      value={{
        getContents,
        getFields,
        createContent,
        updateContent,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useContent = () => useContext(Context);
