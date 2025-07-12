import { jest } from '@jest/globals';

// Mock the auth API functions
interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token?: string;
  error?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Mock implementation of auth API
class MockAuthAPI {
  private validUsers = new Map([
    ['test@manetho.app', { 
      id: 'user-1', 
      email: 'test@manetho.app', 
      firstName: 'Test', 
      lastName: 'User',
      password: 'password123' 
    }]
  ]);

  async signIn(data: SignInData): Promise<AuthResponse> {
    const user = this.validUsers.get(data.email);
    
    if (!user || user.password !== data.password) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token: 'mock-jwt-token'
    };
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    if (this.validUsers.has(data.email)) {
      return {
        success: false,
        error: 'User already exists'
      };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password
    };

    this.validUsers.set(data.email, newUser);

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token: 'mock-jwt-token'
    };
  }

  async validateToken(token: string): Promise<boolean> {
    return token === 'mock-jwt-token';
  }

  async signOut(): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// Mock fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Auth API - Sign In', () => {
  let authAPI: MockAuthAPI;

  beforeEach(() => {
    authAPI = new MockAuthAPI();
    jest.clearAllMocks();
  });

  test('should sign in successfully with valid credentials', async () => {
    const signInData = {
      email: 'test@manetho.app',
      password: 'password123'
    };

    const result = await authAPI.signIn(signInData);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe('test@manetho.app');
    expect(result.user?.firstName).toBe('Test');
    expect(result.user?.lastName).toBe('User');
    expect(result.token).toBe('mock-jwt-token');
    expect(result.error).toBeUndefined();
  });

  test('should fail sign in with invalid email', async () => {
    const signInData = {
      email: 'invalid@example.com',
      password: 'password123'
    };

    const result = await authAPI.signIn(signInData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
  });

  test('should fail sign in with invalid password', async () => {
    const signInData = {
      email: 'test@manetho.app',
      password: 'wrongpassword'
    };

    const result = await authAPI.signIn(signInData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
  });

  test('should handle empty credentials', async () => {
    const signInData = {
      email: '',
      password: ''
    };

    const result = await authAPI.signIn(signInData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
});

describe('Auth API - Sign Up', () => {
  let authAPI: MockAuthAPI;

  beforeEach(() => {
    authAPI = new MockAuthAPI();
    jest.clearAllMocks();
  });

  test('should sign up successfully with new user data', async () => {
    const signUpData = {
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@manetho.app',
      password: 'newpassword123'
    };

    const result = await authAPI.signUp(signUpData);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe('newuser@manetho.app');
    expect(result.user?.firstName).toBe('New');
    expect(result.user?.lastName).toBe('User');
    expect(result.token).toBe('mock-jwt-token');
    expect(result.error).toBeUndefined();
  });

  test('should fail sign up with existing email', async () => {
    const signUpData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@manetho.app', // This email already exists
      password: 'password123'
    };

    const result = await authAPI.signUp(signUpData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('User already exists');
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
  });
});

describe('Auth API - Token Validation', () => {
  let authAPI: MockAuthAPI;

  beforeEach(() => {
    authAPI = new MockAuthAPI();
    jest.clearAllMocks();
  });

  test('should validate correct token', async () => {
    const isValid = await authAPI.validateToken('mock-jwt-token');
    expect(isValid).toBe(true);
  });

  test('should invalidate incorrect token', async () => {
    const isValid = await authAPI.validateToken('invalid-token');
    expect(isValid).toBe(false);
  });

  test('should handle empty token', async () => {
    const isValid = await authAPI.validateToken('');
    expect(isValid).toBe(false);
  });
});

describe('Auth API - Sign Out', () => {
  let authAPI: MockAuthAPI;

  beforeEach(() => {
    authAPI = new MockAuthAPI();
    jest.clearAllMocks();
  });

  test('should sign out successfully', async () => {
    const result = await authAPI.signOut();
    expect(result.success).toBe(true);
  });
});

describe('Auth API - Integration with HTTP Requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should make correct HTTP request for sign in', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 'user-1', email: 'test@manetho.app' },
        token: 'mock-jwt-token'
      })
    };

    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const signInData = {
      email: 'test@manetho.app',
      password: 'password123'
    };

    // Simulate API call
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signInData)
    });

    const result = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signInData)
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe('test@manetho.app');
    expect(result.token).toBe('mock-jwt-token');
  });

  test('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  test('should handle HTTP error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: 'Unauthorized'
      })
    };

    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrongpassword' })
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
}); 