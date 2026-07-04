import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserContext {
  sub: string;
  username: string;
  role: string;
  departmentId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
