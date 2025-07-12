import { Page } from '@playwright/test';

export class ApiMocks {
  constructor(private page: Page) {}

  /**
   * Mock successful authentication response
   */
  async mockSuccessfulAuth() {
    await this.page.route('**/api/auth/**', async route => {
      const url = route.request().url();
      
      if (url.includes('sign-in')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'test-user-id',
              email: 'test@manetho.app',
              firstName: 'Test',
              lastName: 'User'
            },
            token: 'mock-jwt-token'
          })
        });
      } else if (url.includes('sign-up')) {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'User created successfully',
            user: {
              id: 'test-user-id',
              email: 'test@manetho.app',
              firstName: 'Test',
              lastName: 'User'
            }
          })
        });
      }
    });
  }

  /**
   * Mock failed authentication response
   */
  async mockFailedAuth() {
    await this.page.route('**/api/auth/sign-in', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid credentials'
        })
      });
    });
  }

  /**
   * Mock chat API responses
   */
  async mockChatApi() {
    // Mock getting chat messages
    await this.page.route('**/api/chat/messages', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            messages: [
              {
                id: 'msg-1',
                content: 'Hello, this is a test message',
                userId: 'test-user-id',
                timestamp: new Date().toISOString()
              }
            ]
          })
        });
      } else if (route.request().method() === 'POST') {
        // Mock sending a message
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: {
              id: 'msg-new',
              content: 'New test message',
              userId: 'test-user-id',
              timestamp: new Date().toISOString()
            }
          })
        });
      }
    });

    // Mock online users
    await this.page.route('**/api/chat/online-users', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: 'user-1', name: 'John Doe', status: 'online' },
            { id: 'user-2', name: 'Jane Smith', status: 'online' }
          ]
        })
      });
    });
  }

  /**
   * Mock community API responses
   */
  async mockCommunityApi() {
    // Mock getting threads
    await this.page.route('**/api/community/threads', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            threads: [
              {
                id: 'thread-1',
                title: 'Test Thread Title',
                content: 'This is a test thread content',
                author: 'Test User',
                likes: 5,
                comments: 3,
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      } else if (route.request().method() === 'POST') {
        // Mock creating a thread
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            thread: {
              id: 'thread-new',
              title: 'New Test Thread',
              content: 'New thread content',
              author: 'Test User',
              likes: 0,
              comments: 0,
              createdAt: new Date().toISOString()
            }
          })
        });
      }
    });

    // Mock thread comments
    await this.page.route('**/api/community/threads/*/comments', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            comments: [
              {
                id: 'comment-1',
                content: 'This is a test comment',
                author: 'Test User',
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            comment: {
              id: 'comment-new',
              content: 'New test comment',
              author: 'Test User',
              createdAt: new Date().toISOString()
            }
          })
        });
      }
    });
  }

  /**
   * Mock AI doubt solver API
   */
  async mockDoubtSolverApi() {
    await this.page.route('**/api/doubt-solving', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            solution: {
              id: 'solution-1',
              question: 'What is 2+2?',
              answer: 'The answer is 4. This is a basic arithmetic operation.',
              steps: [
                'Step 1: Identify the operation (addition)',
                'Step 2: Add the numbers: 2 + 2 = 4'
              ],
              confidence: 0.95
            }
          })
        });
      }
    });

    // Mock doubt solving sessions
    await this.page.route('**/api/doubt-solving/sessions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessions: [
            {
              id: 'session-1',
              title: 'Mathematics Help',
              status: 'active',
              createdAt: new Date().toISOString()
            }
          ]
        })
      });
    });
  }

  /**
   * Mock video/audio call APIs
   */
  async mockCallApi() {
    // Mock Agora token generation
    await this.page.route('**/api/agora-token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-agora-token',
          appId: 'mock-app-id',
          channel: 'test-channel'
        })
      });
    });

    // Mock call signaling
    await this.page.route('**/api/call-signal', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          callId: 'test-call-id'
        })
      });
    });
  }

  /**
   * Mock user profile API
   */
  async mockProfileApi() {
    await this.page.route('**/api/community/users/**', async route => {
      const url = route.request().url();
      
      if (url.includes('/posts')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            posts: [
              {
                id: 'post-1',
                title: 'User Post Title',
                content: 'User post content',
                likes: 10,
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-id',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@manetho.app',
              bio: 'Test user bio',
              joinedAt: new Date().toISOString()
            }
          })
        });
      }
    });
  }

  /**
   * Mock file upload API
   */
  async mockFileUploadApi() {
    await this.page.route('**/api/upload', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fileUrl: 'https://example.com/mock-file.pdf',
          fileName: 'test-document.pdf'
        })
      });
    });
  }

  /**
   * Clear all mocks
   */
  async clearMocks() {
    await this.page.unroute('**/*');
  }
} 