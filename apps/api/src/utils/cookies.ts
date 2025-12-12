/**
 * Cookie Utility Functions
 * Secure cookie management for authentication tokens
 */

import { Response } from 'express';
import { getEnv, isProduction } from '../config/env';

export interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: isProduction() || getEnv('COOKIE_SECURE') === 'true',
  sameSite: (isProduction() ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
};

/**
 * Set access token cookie
 */
export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie('access_token', token, {
    ...COOKIE_SETTINGS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Set refresh token cookie
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, {
    ...COOKIE_SETTINGS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear all auth cookies
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', COOKIE_SETTINGS);
  res.clearCookie('refresh_token', COOKIE_SETTINGS);
}

/**
 * Set user info cookie (non-sensitive data only)
 */
export function setUserInfoCookie(res: Response, user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}): void {
  res.cookie('user_info', JSON.stringify({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }), {
    ...COOKIE_SETTINGS,
    httpOnly: false, // This cookie needs to be readable by frontend
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
