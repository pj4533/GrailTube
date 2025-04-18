import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/constants';
import logger from '@/lib/logger';

/**
 * GET /api/auth/verify - Verify admin authentication status
 */
export async function GET() {
  try {
    // Check if admin token cookie exists
    const adminToken = cookies().get(ADMIN_TOKEN_COOKIE);
    
    // Verify admin status
    const isAdmin = !!adminToken?.value;
    
    logger.debug('Admin verification check', { isAdmin });
    
    return NextResponse.json({
      isAdmin,
    });
  } catch (error) {
    logger.error('Error in admin verification endpoint', error);
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    );
  }
}

// Make this route dynamic to avoid static generation errors
export const dynamic = 'force-dynamic';