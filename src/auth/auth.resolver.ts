import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtUser } from './interfaces/jwt-user.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentRefreshToken } from './decorators/current-refresh-token.decorator';
import { LogoutResponseDto } from './dto/logout-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseDto)
  register(@Args('input') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthResponseDto)
  login(@Args('input') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Mutation(() => AuthResponseDto)
  @UseGuards(RefreshTokenGuard)
  refreshTokens(
    @Args('input') _refreshTokenDto: RefreshTokenDto,
    @CurrentUser() user: JwtUser,
    @CurrentRefreshToken() refreshToken: string,
  ) {
    return this.authService.refreshTokens(user.id, refreshToken);
  }

  @Query(() => AuthResponseDto)
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.id);
  }

  @Mutation(() => LogoutResponseDto)
  @UseGuards(AccessTokenGuard)
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.id);
  }
}
