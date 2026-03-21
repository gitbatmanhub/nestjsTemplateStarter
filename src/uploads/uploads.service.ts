import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'static', 'uploads');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(fileName: string) {
    const filePath = join(this.uploadDir, fileName);
    if (!existsSync(filePath)) {
      throw new BadRequestException(`File ${fileName} was not found`);
    }

    return filePath;
  }
}
