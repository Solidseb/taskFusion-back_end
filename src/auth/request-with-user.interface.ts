import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string; // UUID is a string now
    email: string;
  };
}
