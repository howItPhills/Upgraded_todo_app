import type { Request } from "express";

// Params, ResBody, ReqBody, ReqQuery
export type AuthedRequest<T = {}, U = {}, V = {}, W = {}> = Request<
  T,
  U,
  { userId: number } & V,
  W
>;

export type PostTaskRequest = AuthedRequest<{}, {}, { task: string }>;
export type PutToTaskRequest = AuthedRequest<
  { todoId: string },
  {},
  { completed: boolean }
>;

export type DeleteTaskRequest = AuthedRequest<{ todoId: string }>;

// Auth Routes Types
export type RegisterRequest = Request<
  {},
  {},
  { username: string; password: string }
>;
export type LoginRequest = Request<
  {},
  {},
  { username: string; password: string }
>;
