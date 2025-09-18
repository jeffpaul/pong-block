# Contributing to Pong Block

Thanks for your interest in contributing!

## Branching & Release Flow

- All new development and PRs should branch from `develop`.
- Merge to `main` only for release candidates.
- **The build process is automated via GitHub Actions** - source files are automatically compiled and deployed.
- Source files, docs, and code reviews occur on feature branches & `develop`.

### Branch Structure

- **`develop`**: Active development branch where all PRs are merged
- **`main`**: Release candidate branch with automated builds
- **`stable`**: Production release branch for WordPress.org distribution

## Automated Build & Deploy Process

### Development Workflow
1. Create feature branches from `develop`
2. Submit PRs to `develop` branch
3. Built files are automatically generated - **do not commit `/build` directory manually**

### Release Process
1. **Release Candidate**: Merge `develop` → `main`
   - GitHub Actions automatically builds and commits compiled assets
   - Creates release candidate for testing

2. **Production Release**: Merge `main` → `stable`
   - Triggers automated deployment to WordPress.org
   - Updates version tags and release notes

### What Gets Automated
- JavaScript compilation and minification
- CSS processing and optimization  
- PHP file preparation
- Version bumping and tagging
- WordPress.org SVN deployment

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
- **Do not include built files** in your PRs - these are handled automatically

## Release Notes

- Built/compiled files (`/build`) are automatically generated and committed by GitHub Actions.
- *Do not* include `/node_modules`, lockfiles, or manually built files in PRs.
- Test with `wp-env` or WordPress Playground before merging to `main`.
- Monitor GitHub Actions for successful builds before proceeding with releases.
