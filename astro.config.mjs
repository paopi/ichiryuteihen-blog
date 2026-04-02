// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://paopi.github.io',
  base: '/ichiryuteihen-blog',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
