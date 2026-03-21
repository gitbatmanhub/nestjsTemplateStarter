import { Response } from 'express';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('single')
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/uploads',
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadSingle(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A file is required');
    }

    return {
      fileName: file.filename,
      url: `${this.configService.getOrThrow<string>('API_URL')}/api/uploads/${file.filename}`,
    };
  }

  @Post('multiple')
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 5 }], {
      storage: diskStorage({
        destination: './static/uploads',
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadMultiple(
    @UploadedFiles()
    files: {
      files?: Express.Multer.File[];
    },
  ) {
    const uploadedFiles = files.files ?? [];
    if (!uploadedFiles.length) {
      throw new BadRequestException('At least one file is required');
    }

    return uploadedFiles.map((file) => ({
      fileName: file.filename,
      url: `${this.configService.getOrThrow<string>('API_URL')}/api/uploads/${file.filename}`,
    }));
  }

  @Get(':fileName')
  getFile(@Param('fileName') fileName: string, @Res() response: Response) {
    const filePath = this.uploadsService.getFilePath(fileName);
    response.sendFile(filePath);
  }
}
