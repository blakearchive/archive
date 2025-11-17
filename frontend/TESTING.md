# Angular Testing Guide

## Test Configuration

This project uses Jasmine and Karma for unit testing Angular components and services.

### Test Setup

- **Test Framework**: Jasmine 5.9.0
- **Test Runner**: Karma 6.4.0
- **Browser**: Chrome Headless (for CI/CD)

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
ng test

# Run tests with coverage
ng test --code-coverage
```

### Test Structure

#### Service Tests
- `blake-data.service.spec.ts` - Tests for Blake Archive API service
- `search.service.spec.ts` - Tests for search functionality
- `cart.service.spec.ts` - Tests for shopping cart/lightbox service

#### Component Tests
- `home.spec.ts` - Tests for homepage with featured works
- `object.spec.ts` - Tests for object viewer component
- `work.spec.ts` - Tests for work display component

### Test Coverage

The test suite covers:

1. **BlakeDataService** (100% coverage)
   - API endpoint integration
   - Error handling
   - Data transformation

2. **SearchService** (100% coverage)
   - Search configuration management
   - Query execution
   - Stop words filtering
   - Results handling

3. **CartService** (100% coverage)
   - Add/remove items
   - LocalStorage persistence
   - Export functionality
   - Item sorting

4. **Components** (Core functionality)
   - Component initialization
   - Data loading
   - User interactions
   - Error states

### Writing New Tests

When adding new components or services, follow these patterns:

#### Service Test Template
```typescript
describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

#### Component Test Template
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [/* mock services */]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### CI/CD Integration

Tests are configured to run in headless Chrome for CI/CD pipelines:

```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

### Troubleshooting

**Chrome not found error:**
```
Set CHROME_BIN environment variable:
export CHROME_BIN=/usr/bin/chromium-browser
```

**Tests timing out:**
```
Increase timeout in karma.conf.js:
browserNoActivityTimeout: 60000
```

**Import errors:**
```
Ensure all dependencies are installed:
npm install
```
