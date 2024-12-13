import { Request } from "express";

export type requestBody<T> = Request<{}, {}, T>
export type requestQuery<T> = Request<{}, {}, {}, T>
export type requestParamsAndBody<T,B> = Request<T, {}, B>
export type requestParams<T> = Request<T>
export type requestQueryAndBody<T,B> = Request<{}, {}, B, T>
