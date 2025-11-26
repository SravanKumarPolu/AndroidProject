# Setup Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials (optional, for cloud sync)
   - Add Sentry DSN (optional, for error tracking)

3. **Run the App**
   ```bash
   npm start
   ```

## Service Initialization

All services are automatically initialized when the app starts:

- **Analytics**: Tracks app usage and events
- **Performance Monitoring**: Tracks screen load times and performance
- **Internationalization**: Detects device locale and sets language
- **Error Recovery**: Handles network and storage errors automatically

## Configuration

### Analytics

Analytics is enabled by default. To integrate with a provider:

1. Install provider SDK (e.g., `@react-native-firebase/analytics`)
2. Uncomment provider code in `src/services/analytics.ts`
3. Configure provider credentials

### Internationalization

Supported languages:
- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Hindi (hi)
- Japanese (ja)

To change language programmatically:
```typescript
import { i18n } from '@/i18n';
i18n.setLocale('es');
```

### Performance Monitoring

Enabled in production by default. To disable:
```typescript
import { performanceMonitor } from '@/utils/performance';
performanceMonitor.setEnabled(false);
```

## Development

### Running Tests
```bash
npm test
npm run test:coverage
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Accessibility Audit
```bash
npm run accessibility:audit
```

### Bundle Size Check
```bash
npm run check:bundle-size web
npm run check:bundle-size android
```

## CI/CD

The project includes GitHub Actions workflows:
- Lint and type check on every push
- Tests with coverage reporting
- Bundle size monitoring
- Security audits
- Accessibility audits

## Dependencies

Dependencies are automatically updated via Dependabot:
- Weekly npm package updates
- Monthly GitHub Actions updates
- Major versions require manual review

