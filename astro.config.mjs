// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import fs from "fs";

// Load automated redirects
const redirects = JSON.parse(fs.readFileSync("./src/redirects.json", "utf8"));

// https://astro.build/config
export default defineConfig({
  site: "https://zamaluj.pl",
  base: '/',
  trailingSlash: 'always',
  integrations: [tailwind(), sitemap()],
  redirects: redirects
});
