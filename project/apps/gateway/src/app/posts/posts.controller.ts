import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GatewayPostsService } from './posts.service';
import { SERVICES } from '../common/clients/services';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly http: HttpService,
    private readonly gatewayPosts: GatewayPostsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список постов + агрегация (author, likesCount, commentsCount)' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  list(@Query() query: Record<string, unknown>) {
    return this.gatewayPosts.listPosts(query);
  }

  @Get('drafts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Мои черновики (proxy → content)' })
  async drafts(@Headers('authorization') auth: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${SERVICES.content}/posts/drafts`, {
        headers: { Authorization: auth },
      }),
    );
    return data;
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск по заголовку (proxy → content)' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') q: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${SERVICES.content}/posts/search`, { params: { q } }),
    );
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детали поста + агрегация' })
  @ApiParam({ name: 'id', description: 'UUID поста' })
  getOne(@Param('id') id: string) {
    return this.gatewayPosts.getPost(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать пост (proxy → content)' })
  @ApiResponse({ status: 201 })
  async create(
    @Headers('authorization') auth: string,
    @Body() body: unknown,
  ) {
    const { data } = await firstValueFrom(
      this.http.post(`${SERVICES.content}/posts`, body, {
        headers: { Authorization: auth },
      }),
    );
    return data;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить пост (proxy → content)' })
  async update(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: unknown,
  ) {
    const { data } = await firstValueFrom(
      this.http.patch(`${SERVICES.content}/posts/${id}`, body, {
        headers: { Authorization: auth },
      }),
    );
    return data;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пост (proxy → content)' })
  async remove(@Param('id') id: string, @Headers('authorization') auth: string) {
    const { data } = await firstValueFrom(
      this.http.delete(`${SERVICES.content}/posts/${id}`, {
        headers: { Authorization: auth },
      }),
    );
    return data;
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Репост (proxy → content)' })
  async repost(@Param('id') id: string, @Headers('authorization') auth: string) {
    const { data } = await firstValueFrom(
      this.http.post(`${SERVICES.content}/posts/${id}/repost`, {}, {
        headers: { Authorization: auth },
      }),
    );
    return data;
  }
}
