import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['ゲーム', 'IT', 'FX', 'その他']),
    description: z.string(),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: image().optional(),
  }),
});

export const collections = { posts };
