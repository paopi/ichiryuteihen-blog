import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categoryLabels } from './categories';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(categoryLabels as [string, ...string[]]),
    description: z.string(),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: image().optional(),
  }),
});

export const collections = { posts };
