import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/constants';
import logger from '@/lib/logger';

/**
 * POST /api/auth/logout - Admin logout endpoint
 */
export async function POST() {
  try {
    // Delete the admin token cookie
    cookies().delete(ADMIN_TOKEN_COOKIE);
    
    logger.info('Admin logout successful');
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Error in admin logout endpoint', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Make this route dynamic to avoid static generation errors
export const dynamic = 'force-dynamic';