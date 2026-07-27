// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static site today. To add accounts / ticketing / payments later, install
// @astrojs/vercel, set `adapter: vercel()` + `output: 'server'`, and mark
// dynamic routes with `export const prerender = false` (plus src/pages/api/*).
export default defineConfig({
  site: 'https://amplifyforyouth.cc',
  output: 'static',
  integrations: [sitemap()],
});
