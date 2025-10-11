# Test Suite Documentation

This directory contains comprehensive tests for the BMP Restaurant AI Assistant project.

## Test Structure

### Unit Tests
- **API Tests**: `src/app/api/vapi/*/__tests__/`
  - `call/route.test.ts` - Tests for call creation and management
  - `webhook/route.test.ts` - Tests for webhook event processing
  - `assistants/route.test.ts` - Tests for assistant management

- **Component Tests**: `src/app/components/__tests__/`
  - `SimpleVapiWidget.test.tsx` - Tests for Vapi widget component
  - `LanguageSwitcher.test.tsx` - Tests for language switching functionality
  - `CallButton.test.tsx` - Tests for call initiation button
  - `LayoutContent.test.tsx` - Tests for layout and routing logic

- **Context Tests**: `src/app/contexts/__tests__/`
  - `LanguageContext.test.tsx` - Tests for language context and translations
  - `AuthContext.test.tsx` - Tests for authentication context

- **Translation Tests**: `src/app/i18n/__tests__/`
  - `translations.test.ts` - Tests for translation consistency and completeness

### Integration Tests
- **`integration.test.ts`** - Tests for API integration and component interaction
- **`middleware.test.ts`** - Tests for Next.js middleware functionality

### End-to-End Tests
- **`e2e.test.ts`** - Complete user journey tests
- **`performance.test.ts`** - Performance and load testing
- **`security.test.ts`** - Security and input validation tests
- **`accessibility.test.ts`** - Accessibility and internationalization tests

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

### Specific Test Files
```bash
# Unit tests only
npm test -- --testPathPattern="__tests__"

# Integration tests only
npm test -- --testPathPattern="integration"

# E2E tests only
npm test -- --testPathPattern="e2e"
```

## Test Coverage

The test suite aims for:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Categories

### 1. Unit Tests
Test individual components and functions in isolation.

**Coverage:**
- API endpoints (call, webhook, assistants)
- React components (widgets, buttons, layouts)
- Context providers (language, auth)
- Translation files
- Utility functions

### 2. Integration Tests
Test how different parts of the system work together.

**Coverage:**
- API endpoint integration
- Component interaction
- Middleware functionality
- Error handling flows

### 3. End-to-End Tests
Test complete user journeys and workflows.

**Coverage:**
- User language switching
- Call initiation and completion
- Webhook event processing
- Error recovery scenarios

### 4. Performance Tests
Test system performance under various conditions.

**Coverage:**
- Response time consistency
- Concurrent request handling
- Memory usage
- Load testing

### 5. Security Tests
Test security measures and input validation.

**Coverage:**
- Input sanitization
- Authentication handling
- Rate limiting
- DoS protection
- Error information disclosure

### 6. Accessibility Tests
Test accessibility and internationalization features.

**Coverage:**
- Language support
- Geographic detection
- URL handling
- Cookie management
- Error handling

## Test Data

### Mock Data
Tests use mock data for:
- Vapi API responses
- Firebase authentication
- Webhook events
- User interactions

### Environment Variables
Tests mock environment variables:
- `VAPI_PRIVATE_KEY`
- `VAPI_PUBLIC_KEY`
- `VAPI_ASSISTANT_ID`

## Test Utilities

### Mocking
- **Fetch API**: Mocked for API testing
- **Next.js Router**: Mocked for navigation testing
- **Firebase Auth**: Mocked for authentication testing
- **Console Methods**: Mocked to reduce test noise

### Test Helpers
- **Language Provider**: Wrapper for language context testing
- **Auth Provider**: Wrapper for authentication context testing
- **Mock Requests**: Helper functions for creating test requests

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Scheduled runs

### CI Pipeline
1. **Install Dependencies**: `npm ci`
2. **Lint Code**: `npm run lint`
3. **Run Tests**: `npm run test:ci`
4. **Build Project**: `npm run build`
5. **Deploy**: Automatic deployment on success

## Debugging Tests

### Running Specific Tests
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="should handle"

# Run tests in a specific file
npm test -- --testPathPattern="CallButton.test.tsx"

# Run tests with verbose output
npm test -- --verbose
```

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --detectOpenHandles --forceExit
```

### Coverage Debugging
```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Test one thing per test
4. **Mock Dependencies**: Mock external dependencies
5. **Clean Up**: Clean up after each test

### Test Organization
1. **Group Related Tests**: Use `describe` blocks
2. **Setup and Teardown**: Use `beforeEach` and `afterEach`
3. **Test Data**: Use consistent test data
4. **Assertions**: Use specific assertions

### Performance
1. **Parallel Execution**: Tests run in parallel by default
2. **Mock Heavy Operations**: Mock API calls and file operations
3. **Clean State**: Ensure tests don't affect each other
4. **Timeout Handling**: Set appropriate timeouts

## Troubleshooting

### Common Issues

#### Tests Failing
- Check mock implementations
- Verify environment variables
- Ensure proper cleanup
- Check for race conditions

#### Slow Tests
- Mock external dependencies
- Use `jest.clearAllMocks()`
- Avoid real API calls
- Optimize test data

#### Coverage Issues
- Add tests for uncovered branches
- Test error conditions
- Test edge cases
- Verify mock coverage

### Getting Help
- Check test output for specific errors
- Review mock implementations
- Verify test data
- Check environment setup

## Contributing

When adding new tests:
1. Follow existing patterns
2. Add appropriate mocks
3. Test both success and error cases
4. Update documentation
5. Ensure CI passes

### Test Checklist
- [ ] Unit tests for new components
- [ ] Integration tests for new features
- [ ] E2E tests for user journeys
- [ ] Performance tests for critical paths
- [ ] Security tests for input validation
- [ ] Accessibility tests for new UI elements
