# Contributing to Eon

Thank you for your interest in contributing to Eon! We welcome all contributions that help improve the platform.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/BipDeep.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Make your changes
6. Run tests: `pnpm test`
7. Commit your changes: `git commit -m "Add your message"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Code Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Development Workflow

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Run linter
pnpm check

# Build project
pnpm build

# Run tests (when available)
pnpm test
```

## Project Structure

- `src/frontend/` - React UI components and pages
- `src/backend/` - Motoko canister smart contracts
- `scripts/` - Build and utility scripts

## Reporting Issues

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

## Questions?

Open a discussion or issue with the label `question`.

Thanks for contributing! 🚀
