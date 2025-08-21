# Contributing to Whish Payment SDK

Thank you for your interest in contributing to the Whish Payment SDK! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/samish-dev/whish-module.git
   cd whish-module
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Start Development Mode**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── index.ts              # Main client implementation
├── types/
│   └── index.d.ts        # TypeScript type definitions
└── util/
    └── APIException.ts   # Custom error handling

tests/
└── WishPaymentClient.test.ts  # Test suites

docs/
├── README.md            # Main documentation
├── EXAMPLES.md          # Usage examples
└── CONTRIBUTING.md      # This file
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Messages

Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation updates
- `test`: Test additions/updates
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Maintenance tasks

Examples:
```
feat(client): add timeout configuration option
fix(error): improve error message formatting
docs(readme): update installation instructions
test(client): add validation test cases
```

### Testing

- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names
- Group related tests in `describe` blocks
- Mock external dependencies

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### TypeScript

- Use strict TypeScript configuration
- Export all public types
- Document complex types with JSDoc
- Use meaningful type names
- Avoid `any` type when possible

## Contributing Process

### 1. Issue First

For significant changes, please create an issue first to discuss:
- Bug reports
- Feature requests
- API changes
- Breaking changes

### 2. Fork and Branch

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 3. Development

1. Make your changes
2. Add or update tests
3. Update documentation if needed
4. Ensure all tests pass:
   ```bash
   npm test
   ```
5. Build the project:
   ```bash
   npm run build
   ```

### 4. Pull Request

1. Commit your changes with descriptive messages
2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Create a Pull Request with:
   - Clear title and description
   - Reference to related issues
   - List of changes made
   - Screenshots (if applicable)

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass locally
- [ ] Code builds without errors
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No breaking changes (or clearly documented)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Related Issues
Closes #(issue number)

## Additional Notes
Any additional information or context
```

## Code Review Process

1. **Automated Checks**: All PRs must pass:
   - TypeScript compilation
   - Test suite
   - Code coverage thresholds

2. **Manual Review**: Code will be reviewed for:
   - Code quality and style
   - Test coverage
   - Documentation
   - Breaking changes
   - Security considerations

3. **Feedback**: Address review feedback by:
   - Making requested changes
   - Explaining decisions if needed
   - Updating tests and docs

## Release Process

Releases are managed by maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

### Version Guidelines

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

## Questions and Support

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for sensitive issues

## Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

### Standards

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment of any kind
- Discriminatory language or actions
- Personal attacks
- Publishing private information without permission
- Unprofessional conduct

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for significant contributions
- package.json contributors field
- GitHub contributors page

Thank you for contributing to the Whish Payment SDK! 🎉
