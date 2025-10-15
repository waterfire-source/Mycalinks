import { CustomError } from '@/api/implement';
import { launchDef } from '@/app/api/launch/def';

export interface AuthAPI {
  launch: {
    request: {
      email: string;
      password: string;
    };
    response: typeof launchDef.response | CustomError;
  };
}

export interface AuthApiRes {
  launch: Exclude<AuthAPI['launch']['response'], CustomError>;
}
