// Set up environment variables for testing
process.env.NODE_ENV = 'test'

// Database URL for testing (using a test database)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/manetho_test'

// Clerk authentication
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_pk_123'
process.env.CLERK_SECRET_KEY = 'test_sk_123'
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/sign-in'
process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/sign-up'
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = '/home'
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = '/home'

// Agora video calling
process.env.NEXT_PUBLIC_AGORA_APP_ID = 'test_agora_app_id'
process.env.AGORA_APP_CERTIFICATE = 'test_agora_certificate'

// Appwrite file storage
process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = 'https://test-appwrite.example.com'
process.env.NEXT_PUBLIC_APPWRITE_PROJECT = 'test_project_id'
process.env.APPWRITE_API_KEY = 'test_api_key'

// AI service (mock)
process.env.OPENAI_API_KEY = 'test_openai_key'

// Pusher for real-time features
process.env.NEXT_PUBLIC_PUSHER_APP_ID = 'test_pusher_app_id'
process.env.NEXT_PUBLIC_PUSHER_KEY = 'test_pusher_key'
process.env.PUSHER_SECRET = 'test_pusher_secret'
process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'us2'

// Next.js specific
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test_nextauth_secret'

// Test database connection timeout
process.env.TEST_TIMEOUT = '30000' 