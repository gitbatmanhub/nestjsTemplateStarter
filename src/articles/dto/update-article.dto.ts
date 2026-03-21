import { InputType, PartialType } from '@nestjs/graphql';
import { CreateArticleDto } from './create-article.dto';

@InputType()
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
