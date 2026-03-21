import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UserRole } from '../auth/enums/user-role.enum';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleFilterDto } from './dto/article-filter.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { LogoutResponseDto } from '../auth/dto/logout-response.dto';

@Resolver(() => Article)
export class ArticlesResolver {
  constructor(private readonly articlesService: ArticlesService) {}

  @Query(() => [Article], { name: 'articles' })
  articles(@Args('filters', { nullable: true }) filters?: ArticleFilterDto) {
    return this.articlesService.findAll(filters ?? {});
  }

  @Query(() => Article, { name: 'article' })
  article(@Args('term') term: string) {
    return this.articlesService.findOne(term);
  }

  @Query(() => [Article], { name: 'myArticles' })
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  myArticles(@CurrentUser() user: JwtUser) {
    return this.articlesService.myArticles(user);
  }

  @Mutation(() => Article)
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  createArticle(
    @Args('input') createArticleDto: CreateArticleDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.articlesService.create(createArticleDto, user);
  }

  @Mutation(() => Article)
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  updateArticle(
    @Args('id') id: string,
    @Args('input') updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Mutation(() => LogoutResponseDto)
  @Auth(UserRole.USER, UserRole.ADMIN, UserRole.EDITOR)
  deleteArticle(@Args('id') id: string, @CurrentUser() user: JwtUser) {
    return this.articlesService.remove(id, user);
  }
}
