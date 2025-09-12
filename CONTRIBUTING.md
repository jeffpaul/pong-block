
# Contributing to Pong Block

Thanks for your interest in contributing!

## Branching & Release Flow

* All new development and PRs should branch from `develop`.
* Merge to `main` only for release candidates.
* **Only built/compiled files (`/build`) should be committed to `main` and `stable` (for release).**
* Source files, docs, and code reviews occur on feature branches & `develop`.

## Code Standards

- Use WordPress block development best practices.
- All strings must be wrapped for translation (i18n).
- Ensure color and accessibility requirements are always met (WCAG AA/AAA where possible).
- JavaScript: Use plain JS for interactivity; match block editor and frontend for game logic and visuals.
- Always test in both frontend and editor.

## Submitting Changes

- PRs should include clear descriptions and testing instructions.
- Update documentation (e.g. `README.md`, Playground, blueprints.json) for new features.
- Write clean, readable code—lint using `@wordpress/scripts`.

## Releasing

* Only commit minified/built JS/CSS and PHP to `main` and `stable`.
* *Do not* include `/node_modules` or lockfiles in repository.
* Test with `wp-env` or WordPress Playground before final merge.

