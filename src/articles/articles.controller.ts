import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UserRole } from '../auth/enums/user-role.enum';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleFilterDto } from './dto/article-filter.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() filterDto: ArticleFilterDto) {
    return this.articlesService.findAll(filterDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  myArticles(@CurrentUser() user: JwtUser) {
    return this.articlesService.myArticles(user);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.articlesService.findOne(term);
  }

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.articlesService.create(createArticleDto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.articlesService.remove(id, user);
  }
}
