import { extractAdminAuth, requireAdminAuth } from '../admin-auth';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('admin-auth', () => {
  const adminPayload = {
    userId: 'admin-123',
    email: 'admin@example.com',
    instanceRole: 'ADMIN' as const,
  };

  const userPayload = {
    userId: 'user-456',
    email: 'user@example.com',
    instanceRole: 'USER' as const,
  };

  const adminToken = jwt.sign(adminPayload, SECRET);
  const userToken = jwt.sign(userPayload, SECRET);
  const invalidToken = 'this-is-not-a-valid-jwt';

  describe('extractAdminAuth', () => {
    it('extracts auth context from Cookie header successfully', async () => {
      const request = new NextRequest('http://localhost/api/admin', {
        headers: {
          Cookie: `auth_token=${adminToken}`,
        },
      });

      const result = await extractAdminAuth(request);
      expect(result).not.toBeNull();
      expect(result).toEqual({
        userId: 'admin-123',
        email: 'admin@example.com',
        instanceRole: 'ADMIN',
        isAdmin: true,
      });
    });

    it('extracts auth context from Authorization Bearer header successfully', async () => {
      const request = new NextRequest('http://localhost/api/admin', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const result = await extractAdminAuth(request);
      expect(result).not.toBeNull();
      expect(result).toEqual({
        userId: 'user-456',
        email: 'user@example.com',
        instanceRole: 'USER',
        isAdmin: false,
      });
    });

    it('returns null if no token is provided', async () => {
      const request = new NextRequest('http://localhost/api/admin');
      const result = await extractAdminAuth(request);
      expect(result).toBeNull();
    });

    it('returns null and logs error if token is invalid', async () => {
      // Temporarily mock console.error to avoid polluting output
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new NextRequest('http://localhost/api/admin', {
        headers: {
          Cookie: `auth_token=${invalidToken}`,
        },
      });

      const result = await extractAdminAuth(request);
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('requireAdminAuth', () => {
    it('returns success: true for user with ADMIN role', async () => {
      const request = new NextRequest('http://localhost/api/admin', {
        headers: {
          Cookie: `auth_token=${adminToken}`,
        },
      });

      const result = await requireAdminAuth(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.auth.isAdmin).toBe(true);
        expect(result.auth.userId).toBe('admin-123');
      }
    });

    it('returns success: false with 403 status for user with USER role', async () => {
      const request = new NextRequest('http://localhost/api/admin', {
        headers: {
          Cookie: `auth_token=${userToken}`,
        },
      });

      const result = await requireAdminAuth(request);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(403);
        expect(result.error).toBe('Admin access required');
      }
    });

    it('returns success: false with 401 status for unauthenticated user', async () => {
      const request = new NextRequest('http://localhost/api/admin');

      const result = await requireAdminAuth(request);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
        expect(result.error).toBe('Authentication required');
      }
    });
  });
});
