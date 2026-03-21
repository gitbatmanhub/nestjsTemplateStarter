import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumberString()
  PORT: string;

  @IsString()
  DB_HOST: string;

  @IsNumberString()
  DB_PORT: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsBooleanString()
  DB_SYNC: string;

  @IsBooleanString()
  DB_SSL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ACCESS_TTL: string;

  @IsString()
  JWT_REFRESH_TTL: string;

  @IsString()
  API_URL: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    ...config,
    PORT: Number(config.PORT),
    DB_PORT: Number(config.DB_PORT),
    DB_SYNC: config.DB_SYNC === 'true',
    DB_SSL: config.DB_SSL === 'true',
  };
}
