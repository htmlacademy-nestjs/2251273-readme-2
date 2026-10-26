import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.upsert({
    where: { id: 'seed-post-1' },
    update: {},
    create: {
      id: 'seed-post-1',
      type: 'text',
      authorId: 'seed-user',
      title: 'Первый тестовый пост',
      announcement: 'Анонс первого поста для проверки Prisma, достаточно длинный.',
      text: 'Полный текст первого поста. Достаточно длинный, чтобы пройти валидацию в будущем.',
      tags: ['seed', 'test'],
    },
  });

  await prisma.post.upsert({
    where: { id: 'seed-post-2' },
    update: {},
    create: {
      id: 'seed-post-2',
      type: 'link',
      authorId: 'seed-user',
      url: 'https://example.com',
      description: 'Тестовая ссылка',
      tags: ['seed'],
    },
  });

  console.log('Seeded 2 posts');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
