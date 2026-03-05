import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Auth.js v5 middleware — handles auth protection for /admin routes
// Security headers are already configured in next.config.js headers()
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
