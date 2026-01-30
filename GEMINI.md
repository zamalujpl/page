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

After a feature is completed and before committing, the following testing plan MUST be invoked across multiple resolutions: mobile (390x844), tablet (912x1368), and desktop (1920x1080).

1.  **Check home page:** Take a screenshot of the home page for each resolution.
2.  **Check random category:** Take a screenshot of one random category index page for each resolution.
3.  **Check random image page:** Take a screenshot of one random image page for each resolution.
4.  **Check random image print functionality:** Take a screenshot of one random image page for each resolution. The user will manually verify the print functionality by navigating to this page and triggering the browser's print dialog.
5.  **Clean Screenshots:** Remove the `screenshots` folder to ensure a clean slate for new screenshots.
6.  **Visual Inspection (User):** The agent will provide the paths to all generated screenshots for the user to visually inspect and approve that everything is displayed correctly.
7.  **Check for broken links:** Check all pages and all links in the app to ensure they work and do not result in a 404 error. (This step is resolution-independent).

*Note: The user prefers using `npm run preview` for local verification.*

## Development Conventions

### Asset Management

The coloring pages are organized into categories, and each category has its own directory within `public/assets`. The structure of these assets is defined in `src/assets.json`. When adding new images or categories, this file MUST be updated accordingly.

There are several scripts in the `scripts` directory to help with asset management, including:

-   `png-to-svg.sh`: Converts PNG files to SVG.
-   `process_assets.js`: Processes and organizes assets.
-   `orchestrate_assets.js`: Orchestrates the asset pipeline.
-   `recreate_svg_title_description.cjs`: Updates the title and description of a single SVG file.
-   `update_svg_titles_from_json.cjs`: Updates all SVG files based on the corresponding category JSON files.

### Styling

The project uses Tailwind CSS for utility-first styling and DaisyUI for pre-built UI components. Custom styles can be added to `src/styles.css`.

### Page Structure

The website's pages are located in `src/pages`. The main page is `src/pages/index.astro`, which uses `src/templates/IndexTemplate.astro` to render the main content. The overall layout is defined in `src/layouts/BaseLayout.astro`.

## Agent Operating Rules

You are a highly constrained agent operating under strict directives. Your actions are governed by the following rules. Any deviation is a critical error.

### Rule 1: No Unauthorized Commits

-   You are absolutely forbidden from executing `git commit` without explicit, direct, and unambiguous permission from the user for that specific commit action.
-   Before requesting permission to commit, you MUST propose the *exact, complete commit message* to the user for review.
-   You will only execute `git commit` *after* the user has given you explicit permission and approved the proposed commit message.

### Rule 2: All File Modifications Must Be Announced and Approved

-   You MUST explicitly state which file(s) you intend to modify and precisely describe the change you propose to make *before* attempting any modification.
-   You will await user approval for *each and every* modification. A lack of objection from the user is considered implicit approval for the *stated* change. If there is *any* ambiguity, you MUST ask for explicit confirmation.
-   Once a modification is approved (implicitly or explicitly), you will proceed with *only* that specific change.

### Rule 3: Strict Adherence to the Testing Plan

-   Before proposing any commit, you MUST have successfully completed the full testing plan as defined in the "Testing" section of this `GEMINI.md` document.
-   This includes (but is not limited to) performing the "Clean Screenshots" step, taking new screenshots for all specified resolutions, and providing the user with the paths to all generated screenshots for visual inspection.

### Rule 4: Explicit Permissions for Tools and Commands

-   You are permitted to use `ls`, `pwd`, and `git` (excluding `commit`, `push`, `pull`). Any other `git` commands (e.g., `git reset`) require explicit user permission *before* execution.
-   You have permission to modify any file within the repository directory, *provided* you follow Rule 2 (announce and await approval for all modifications).
-   You are forbidden from starting or stopping the development server (`http://localhost:4321`) as it is managed by the user.
-   You are permitted to use `agent-browser` for any operation on `http://localhost:4321` as required by the testing plan or other user requests, *provided* such usage aligns with Rule 2.
-   You MUST store information about the application's running URL using the `save_memory` tool when it becomes available.

### Rule 5: Clarity and Conciseness

-   Your communication with the user MUST be concise, clear, and direct. Avoid conversational filler.
-   When providing information or asking for approval, be as specific as possible.

### Rule 6: Post-Approval Actions

-   After the user approves the visual inspection (Rule 6 in Testing), you MUST remove the `screenshots` folder.
-   You MUST NOT execute `git commit` until the user explicitly provides permission for that specific commit action, including the proposed commit message.


## Agent Guidelines (Deprecated - See "Agent Operating Rules")

-   **Self-Verification and Approval:** When making changes, especially those affecting the UI or visual presentation, always perform self-verification using the `scripts/take_screenshots.sh` script across the following resolutions: `912x1368` (tablet), `390x844` (mobile), and `1920x1080` (desktop). Ensure that the changes "look good" across all these resolutions. Only after confirming visual integrity and being confident in the changes, present the work to the user for their opinion. Commit changes *only after* receiving user approval.
-   You are permitted to modify any files in this repository.
-   The development server at `http://localhost:4321` is managed by the user and is always running. Do not start or stop it.
-   You are permitted to use `agent-browser` for any operation on `http://localhost:4321`.
-   Each change that affects the UI or navigation must be validated using `agent-browser`.
-   Store information about the application's running URL using the `save_memory` tool when it becomes available.
-   Feel free to use `git`, `ls`, and `pwd` commands for repository management and basic file system operations.

## Agent Permissions (Deprecated - See "Agent Operating Rules")
- You are allowed to use `mv`, `ls`, and `git` (excluding `push` and `pull`) without asking for permission.
- You have permission to modify any file within the repository directory.
- You must ask for confirmation before committing any changes.