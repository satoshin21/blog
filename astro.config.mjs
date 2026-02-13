// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
// GitHub Pages プロジェクトサイト (satoshin21.github.io/blog) 用
export default defineConfig({
	site: 'https://satoshin21.github.io',
	base: '/blog/',
	integrations: [mdx(), sitemap()],
});
