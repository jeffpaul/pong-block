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

## Automated Build & Deploy Process

### Development Workflow

1. Create feature branches from `develop`
2. Submit PRs to `develop` branch
3. Built files are automatically generated - **do not commit `/build` directory manually**

### Release Process

1. **Release Candidate**: Merge `develop` → `main`

   - GitHub Actions automatically builds and commits compiled assets
   - Creates release candidate for testing

2. **Production Release**: Create and push a tagged release on GitHub

   - Triggers automated deployment to WordPress.org via GitHub Actions
   - Updates version tags and release notes in the WordPress.org repository

### What Gets Automated

- JavaScript compilation and minification
- CSS processing and optimization  
- PHP file preparation
- Version bumping and tagging
- WordPress.org SVN deployment (triggered by GitHub releases)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- WordPress development environment (recommended: `@wordpress/env`)

### Setup

```bash
# Clone the repository
git clone https://github.com/jeffpaul/pong-block.git
cd pong-block

# Install dependencies
npm install

# Start development build (watch mode)
npm run start

# Or create a production build
npm run build
```

### Available Scripts

- `npm run start` - Start development server with watch mode
- `npm run build` - Create production build
- `npm run lint:js` - Lint JavaScript files
- `npm run lint:css` - Lint CSS files
- `npm run format` - Format code using Prettier

## Code Standards

- Use WordPress block development best practices.
- All strings must be wrapped for translation (i18n).
- Ensure color and accessibility requirements are always met (WCAG AA/AAA where possible).
- JavaScript: Use plain JS for interactivity; match block editor and frontend for game logic and visuals.
- Always test in both frontend and editor.
- Follow WordPress coding standards for PHP, JavaScript, and CSS.

## Testing

- Test your changes in both the block editor and frontend.
- Verify accessibility features work with keyboard navigation and screen readers.
- Test responsive design on various screen sizes.
- Ensure all game features work correctly across different difficulty levels and color schemes.

## Submitting Changes

- PRs should include clear descriptions and testing instructions.
- Update documentation (e.g. `README.md`, Playground, blueprints.json) for new features.
- Write clean, readable code—lint using `@wordpress/scripts`.
- **Do not include built files** in your PRs - these are handled automatically
- Include screenshots or GIFs for UI changes.
- Reference any related issues in your PR description.

## Release Notes

- Built/compiled files (`/build`) are automatically generated and committed by GitHub Actions.
- *Do not* include `/node_modules`, lockfiles, or manually built files in PRs.
- Test with `wp-env` or WordPress Playground before merging to `main`.
- Monitor GitHub Actions for successful builds before proceeding with releases.
- Version numbers follow [Semantic Versioning](https://semver.org/).

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Check existing issues and PRs for similar topics
- Review the [Code of Conduct](CODE_OF_CONDUCT.md) for community guidelines
