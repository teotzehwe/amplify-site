// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static by default. The Vercel adapter is here so individual routes can opt
// into on-demand rendering with `export const prerender = false` — today that
// is just `src/pages/api/rsvp.ts`, which forwards RSVPs to the Google Apps
// Script server-side. Every page still ships as static HTML.
export default defineConfig({
  site: 'https://amplifyforyouth.cc',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
});
