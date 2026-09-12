import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each jam/event is one markdown file in src/content/events/.
// Add a jam = add a file. It shows up (sorted by date) on /upcoming-jams
// and gets its own page at /jams/<filename>.
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    tag: z.string().default('community jam'),
    date: z.date(),
    timeLabel: z.string(),
    venue: z.string(),
    // Omit on past/archive jams so detail pages don't show an RSVP CTA.
    rsvpUrl: z.string().optional(),
    poster: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { events };
