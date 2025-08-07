# Repository Guidelines

## Project Structure & Module Organization
- `index.html`: Main entry point for the application.
- `css/`: Contains `style.css` for layout and styling.
- `js/`: Contains `script.js` for interactive functionality.
- Documentation files in root (`README.md`, `CLAUDE.md`, `GEMINI.md`).

## Build & Development Commands
- **Preview locally**: Open `index.html` in your browser.
- **Serve with HTTP server**:
  ```bash
  python3 -m http.server 8000
  ```

## Coding Style & Naming Conventions
- **Indentation**: 2 spaces for CSS and JavaScript.
- **File naming**: kebab-case for files (e.g., `script.js`, `style.css`).
- **JavaScript**: camelCase for functions and variables.

## Testing Guidelines
- No tests are included. Contributions are welcome; add tests under `tests/` with `*.test.js` suffix.

## Commit & Pull Request Guidelines
- Write clear, descriptive commit messages (e.g., `feat: add color picker tool`).
- Reference issues by number (e.g., `Closes #12`).
- Include screenshots or GIFs for UI changes when applicable.
- All PRs require at least one approving review and passing checks.

## Agent-Specific Instructions
See `CLAUDE.md` and `GEMINI.md` for detailed AI agent setups and usage patterns.
