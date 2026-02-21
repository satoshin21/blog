// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkLinkCard from 'remark-link-card-plus';
import rehypeFigureCaption from './src/plugins/rehype-figure-caption.js';

// https://astro.build/config
// GitHub Pages プロジェクトサイト (satoshin21.github.io/blog) 用
export default defineConfig({
	site: 'https://satoshin21.github.io',
	base: '/blog/',
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [
			[
				remarkLinkCard,
				{
					// base: '/blog/' のため cache 有効だと img のパスが /remark-link-card-plus/... になり 404 になるため無効化
					cache: false,
					shortenUrl: true,
					thumbnailPosition: 'right',
				},
			],
		],
		rehypePlugins: [rehypeFigureCaption],
	},
});
