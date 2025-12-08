import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Tree'],
  endpoints: (builder) => ({
    getTree: builder.query({
      query: (rootId) => `network/tree${rootId ? `?rootId=${rootId}` : ''}`,
      providesTags: ['Tree'],
    }),
    getUpline: builder.query({
      query: (userId) => `network/upline?userId=${userId}`,
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useGetTreeQuery, useLoginMutation, useRegisterMutation, useGetUplineQuery } = api;
