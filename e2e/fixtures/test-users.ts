export const TEST_USERS = {
  valid: {
    email: 'test@manetho.app',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  },
  admin: {
    email: 'admin@manetho.app',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    firstName: 'Invalid',
    lastName: 'User'
  }
};

export const TEST_DATA = {
  community: {
    threadTitle: 'Test Thread Title',
    threadContent: 'This is a test thread content for E2E testing',
    commentContent: 'This is a test comment for E2E testing'
  },
  chat: {
    message: 'Hello! This is a test message for E2E testing',
    fileName: 'test-document.pdf'
  },
  studyGroup: {
    name: 'Test Study Group',
    description: 'This is a test study group for E2E testing',
    subject: 'Mathematics'
  }
}; 