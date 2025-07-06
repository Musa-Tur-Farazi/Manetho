This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automated Testing

This repository uses **Jest** + **React Testing Library** for unit & integration tests.  Custom mocks for Next.js, Clerk, Framer-Motion, Agora, KaTeX, Pusher and more are configured in `src/__tests__/setup.ts`.

### Running all tests

```bash
npm test
```

or run a single suite / file:

```bash
npm test -- <path-to-test>
# example
npm test -- src/components/chat/__tests__/AudioCall.test.tsx
```

### Current coverage

| Area | Status |
|------|--------|
| UI components (Badge, Button, Card, FileUpload, ContentCard, PageHeader, GetStartedButton, LoginButton, Sonner, ThemeToggle) | ✅ |
| Authentication components (AuthCheck, AuthModal) | ✅ |
| Chat components (AudioCall, VideoCall, IncomingCallNotification) | ✅ |
| ThemeProvider | ⏳ pending |
| Navbars, landing page sections | ⏳ pending |
| Hooks & utilities | ⏳ pending |
| API integration tests | ⏳ pending |

### Adding new tests

1. Add test files under the relevant `__tests__` directory.
2. Import helpers from `src/__tests__/utils/test-utils.tsx` if you need the default wrapper (providers & mocks).
3. Use `jest.mock()` to stub external SDKs / hooks when necessary.

```tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent />)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
  })
})
```

---

_Last updated: automated test phase-1 (UI, Auth, Chat) – **150 passing assertions**_
