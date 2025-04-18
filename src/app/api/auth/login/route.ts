import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE, ADMIN_TOKEN_EXPIRY_DAYS } from '@/lib/constants';
import crypto from 'crypto';
import logger from '@/lib/logger';

/**
 * POST /api/auth/login - Admin login endpoint
 * This is a more secure implementation than client-side comparison
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const { password } = await request.json();
    
    // Get the admin password from environment variable (server-side only)
    const correctPassword = process.env.ADMIN_PASSWORD;
    
    // Check if password is set
    if (!correctPassword) {
      logger.warn('Admin login attempted but ADMIN_PASSWORD is not set');
      return NextResponse.json(
        { error: 'Admin functionality is not configured' },
        { status: 500 }
      );
    }
    
    // Validate password
    if (password !== correctPassword) {
      logger.warn('Admin login attempted with incorrect password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + ADMIN_TOKEN_EXPIRY_DAYS);
    
    // Set cookie with the token
    cookies().set({
      name: ADMIN_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiryDate,
      path: '/'
    });
    
    logger.info('Admin login successful');
    
    return NextResponse.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Error in admin login endpoint', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Make this route dynamic to avoid static generation errors
export const dynamic = 'force-dynamic';