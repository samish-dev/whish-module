# Changelog

All notable changes to the Whish Payment SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2025-07-10

### Added
- **Enhanced HTTP Client**: New HTTP client with retry logic, connection pooling, and exponential backoff
- **Advanced Logging System**: Configurable logging with multiple levels (DEBUG, INFO, WARN, ERROR)
- **Comprehensive Validation**: Field-specific validation with detailed error messages
- **Debug Logging Support**: Optional debug logging for development environments
- **Error Analysis Methods**: New methods `isRetryable()`, `isClientError()`, `isServerError()`
- **Enhanced Error Serialization**: Improved `toJSON()` method for better error logging
- **Development Tooling**: ESLint, Prettier, TypeDoc for better code quality
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Comprehensive Documentation**: API reference, migration guide, and best practices
- **Enhanced Test Suite**: Over 70% test coverage with comprehensive scenarios

### Changed
- **HTTP Client Architecture**: Replaced direct axios usage with enhanced HTTP client
- **Error Handling**: More robust error handling with automatic retry for transient failures
- **TypeScript Configuration**: Enhanced TypeScript settings for better type safety
- **Package Scripts**: Improved npm scripts for development and deployment
- **Code Quality**: Added linting and formatting with automated fixes
- **Documentation**: Completely rewritten README with detailed examples and best practices

### Fixed
- **URL Validation**: Stricter URL validation requiring HTTP/HTTPS protocols
- **Type Safety**: Fixed TypeScript strict mode issues and enhanced type definitions
- **Error Messages**: More user-friendly error messages with context
- **Package Configuration**: Fixed package.json metadata and export configurations

### Security
- **Request Timeouts**: Enhanced timeout handling to prevent hanging requests
- **Input Validation**: Stricter input validation to prevent malformed requests
- **Error Information**: Improved error handling to avoid information leakage

### Performance
- **Connection Pooling**: Better HTTP connection management
- **Request Deduplication**: Automatic handling of duplicate requests
- **Exponential Backoff**: Smart retry timing for better API usage

### Developer Experience
- **Enhanced IDE Support**: Better autocomplete and type checking
- **Improved Documentation**: Complete API reference with examples
- **Better Error Messages**: More descriptive and actionable error messages
- **Debug Logging**: Optional detailed logging for troubleshooting

## [1.0.2] - 2025-07-10

### Added
- Comprehensive input validation for all API methods
- Enhanced error handling with custom `WhishPaymentApiError` class
- Timeout configuration support (default: 30000ms)
- Custom base URL configuration option
- User-friendly error messages with `getUserFriendlyMessage()` method
- Error retry logic helpers (`isRetryable()`, `isClientError()`, `isServerError()`)
- Extensive JSDoc documentation for all public APIs
- TypeScript interface for client configuration (`WhishClientConfig`)
- Request timeout handling and network error detection
- Enhanced test suite with comprehensive validation testing
- Examples documentation with practical use cases
- Contributing guidelines for developers

### Changed
- **BREAKING**: Constructor now requires `WhishClientConfig` interface instead of inline object
- **BREAKING**: All URLs in `PaymentProps` are now validated for proper format
- Improved error messages with more context and details
- Enhanced TypeScript types with better documentation
- Updated package.json with better metadata and scripts
- Improved README with comprehensive documentation and examples

### Fixed
- Fixed test assertions to match actual API response structure
- Corrected URL validation logic for callback and redirect URLs
- Fixed currency validation to only accept supported currencies ('USD', 'LBP', 'AED')
- Resolved TypeScript export issues for all public interfaces
- Fixed package.json typos (`contributors` field, `release-it` config)

### Security
- Added request timeout to prevent hanging requests
- Enhanced input validation to prevent malformed requests
- Improved error handling to avoid information leakage

## [1.0.1] - 2025-01-XX

### Added
- Initial SDK implementation
- Basic error handling with `WhishPaymentApiError`
- Support for development and production environments
- Core API methods: `getBalance()`, `getPaymentLink()`, `getPaymentStatus()`

### Changed
- Initial release

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Whish Payment SDK
- TypeScript support
- Axios-based HTTP client
- Jest testing framework setup

---

## Legend

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
