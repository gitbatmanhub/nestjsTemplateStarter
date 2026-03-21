import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UserRole } from '../auth/enums/user-role.enum';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleFilterDto } from './dto/article-filter.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto, user: JwtUser) {
    const article = this.articleRepository.create({
      ...createArticleDto,
      slug: createArticleDto.slug ?? createArticleDto.title,
      tags: createArticleDto.tags ?? [],
      published: createArticleDto.published ?? false,
      authorId: user.id,
      author: { id: user.id } as Article['author'],
    });

    return this.articleRepository.save(article);
  }

  async findAll(filterDto: ArticleFilterDto) {
    const { limit = 10, offset = 0, search, published } = filterDto;
    const queryBuilder = this.articleRepository.createQueryBuilder('article');

    if (typeof published === 'boolean') {
      queryBuilder.andWhere('article.published = :published', { published });
    }

    if (search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.slug ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    return queryBuilder
      .take(limit)
      .skip(offset)
      .orderBy('article.createdAt', 'DESC')
      .getMany();
  }

  async findOne(term: string) {
    const article = await this.articleRepository.findOne({
      where: [{ id: term }, { slug: term }],
    });

    if (!article) {
      throw new NotFoundException(`Article ${term} was not found`);
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: JwtUser) {
    const article = await this.findOne(id);
    this.ensureCanManageArticle(article, user);

    Object.assign(article, updateArticleDto);
    if (updateArticleDto.title && !updateArticleDto.slug) {
      article.slug = updateArticleDto.title;
    }

    return this.articleRepository.save(article);
  }

  async remove(id: string, user: JwtUser) {
    const article = await this.findOne(id);
    this.ensureCanManageArticle(article, user);
    await this.articleRepository.remove(article);

    return {
      message: `Article ${id} deleted successfully`,
    };
  }

  async myArticles(user: JwtUser) {
    return this.articleRepository.find({
      where: { authorId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  private ensureCanManageArticle(article: Article, user: JwtUser) {
    const isOwner = article.authorId === user.id;
    const isAdmin = user.roles.includes(UserRole.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have access to manage this article',
      );
    }
  }
}
