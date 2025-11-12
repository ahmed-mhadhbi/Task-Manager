import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import type { SignOptions } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';

export interface AuthResponse {
  accessToken: string;
  user: UserEntity;
}

type PrismaUser = Awaited<ReturnType<UsersService['create']>>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password = await this.hashPassword(dto.password);
    const user = await this.usersService.create({ ...dto, password });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await this.comparePassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserEntity, user, {
      enableImplicitConversion: true,
    });
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async buildAuthResponse(user: PrismaUser): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name ?? null,
    };
    const expiresIn =
      this.configService.get<SignOptions['expiresIn']>('JWT_EXPIRES_IN') ??
      '7d';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn });

    const safeUser = plainToInstance(UserEntity, user, {
      enableImplicitConversion: true,
    });

    return {
      accessToken,
      user: safeUser,
    };
  }
}
