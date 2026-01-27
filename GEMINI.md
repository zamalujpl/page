# Project: Zamaluj.pl

## Project Overview

This project is a website for `zamaluj.pl`, a Polish platform offering free, printable coloring pages for all ages. The site is built using the [Astro](https://astro.build/) web framework, styled with [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/), and statically generated for optimal performance.

The core of the website's content is managed through a comprehensive `assets.json` file, which categorizes and lists all available coloring pages. The structure includes various themes like animals, nature, vehicles, holidays, and more. Pages are dynamically generated based on the information in this JSON file.

## Building and Running

The project's dependencies and scripts are defined in `package.json`.

**Installation:**

To install the necessary dependencies, run:

```bash
npm install
```

**Development:**

To start the local development server, run:

```bash
npm run dev
```

This will start the server at `http://localhost:4321`.

**Building:**

To build the production-ready website, run:

```bash
npm run build
```

The output will be generated in the `./dist/` directory.

**Previewing the Build:**

To preview the production build locally, run:

```bash
npm run preview
```

The output will be generated in the `./dist/` directory.

## Testing

*Note: The user prefers using `npm run preview` for local verification.*

Use agent-browser to test the login flow. Run `agent-browser --help` to see available commands.

## Development Conventions

### Asset Management

The coloring pages are organized into categories, and each category has its own directory within `public/assets`. The structure of these assets is defined in `src/assets.json`. When adding new images or categories, this file must be updated accordingly.

There are several scripts in the `scripts` directory to help with asset management, including:

-   `png-to-svg.sh`: Converts PNG files to SVG.
-   `process_assets.js`: Processes and organizes assets.
-   `orchestrate_assets.js`: Orchestrates the asset pipeline.

### Styling

The project uses Tailwind CSS for utility-first styling and DaisyUI for pre-built UI components. Custom styles can be added to `src/styles.css`.

### Page Structure

The website's pages are located in `src/pages`. The main page is `src/pages/index.astro`, which uses `src/templates/IndexTemplate.astro` to render the main content. The overall layout is defined in `src/layouts/BaseLayout.astro`.
