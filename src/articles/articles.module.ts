import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Article } from './entities/article.entity';
import { ArticlesController } from './articles.controller';
import { ArticlesResolver } from './articles.resolver';
import { ArticlesService } from './articles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), AuthModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesResolver],
})
export class ArticlesModule {}
