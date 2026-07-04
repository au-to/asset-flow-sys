import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { department: true },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
    };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department.name,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.department.name,
    };
  }
}
