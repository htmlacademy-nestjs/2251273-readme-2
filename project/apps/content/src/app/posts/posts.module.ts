import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './repositories/posts.repository';
import { InMemoryPostsRepository } from './repositories/in-memory-posts.repository';
import { PrismaPostsRepository } from './repositories/prisma-posts.repository';
import { CommentsModule } from '../comments/comments.module';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => CommentsModule),
    forwardRef(() => LikesModule),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    InMemoryPostsRepository,
    PrismaPostsRepository,
    {
      provide: PostsRepository,
      useFactory: (
        config: ConfigService,
        prismaRepo: PrismaPostsRepository,
        memRepo: InMemoryPostsRepository,
      ) => (config.get('USE_PRISMA') === 'true' ? prismaRepo : memRepo),
      inject: [ConfigService, PrismaPostsRepository, InMemoryPostsRepository],
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
