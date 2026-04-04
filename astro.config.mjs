// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ichiryuteihen-blog.pages.dev',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
