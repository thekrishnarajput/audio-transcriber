import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

// Interface for the auth middleware to add the user type in the request
export interface IRequest extends Request<
  ParamsDictionary,
  any,
  any,
  ParsedQs,
  Record<string, any>
> {
  user?: any;
  files?: any;
  subdomain?: any;
  baseUrlOrigin?: any;
  urlConfig?: any;
  service?: any;
}

export type IResponse = Response<any, Record<string, any>>;

export interface INextFunction extends NextFunction {}
