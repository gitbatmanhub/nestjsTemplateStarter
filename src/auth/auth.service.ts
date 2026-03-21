import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const user = this.userRepository.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      password: await bcrypt.hash(registerDto.password, 10),
      roles: registerDto.roles?.length ? registerDto.roles : [UserRole.USER],
    });

    await this.userRepository.save(user);
    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        isActive: true,
        roles: true,
        currentHashedRefreshToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.findActiveUserById(userId);
    return this.buildAuthResponse(user, false);
  }

  async refreshTokens(userId: string, rawRefreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        roles: true,
        currentHashedRefreshToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user?.currentHashedRefreshToken || !user.isActive) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      rawRefreshToken,
      user.currentHashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    return this.buildAuthResponse(user);
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });

    return {
      message: 'Session closed successfully',
    };
  }

  async validateAccessTokenUser(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.findActiveUserById(payload.sub);
  }

  async validateRefreshTokenUser(payload: JwtPayload, refreshToken: string) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.findActiveUserById(payload.sub, true);
    return {
      ...user,
      refreshToken,
    };
  }

  private async buildAuthResponse(user: User, includeTokens = true) {
    const sanitizedUser = await this.findActiveUserById(user.id);
    const accessToken = includeTokens
      ? await this.signToken(sanitizedUser, 'access')
      : null;
    const refreshToken = includeTokens
      ? await this.signToken(sanitizedUser, 'refresh')
      : null;

    if (refreshToken) {
      await this.userRepository.update(sanitizedUser.id, {
        currentHashedRefreshToken: await bcrypt.hash(refreshToken, 10),
      });
    }

    return new AuthResponseDto({
      user: sanitizedUser,
      accessToken,
      refreshToken,
    });
  }

  private async signToken(user: User, type: 'access' | 'refresh') {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      type,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn:
        type === 'access'
          ? this.configService.getOrThrow<string>('JWT_ACCESS_TTL')
          : this.configService.getOrThrow<string>('JWT_REFRESH_TTL'),
    });
  }

  private async findActiveUserById(id: string, withRefreshToken = false) {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        roles: true,
        currentHashedRefreshToken: withRefreshToken,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
