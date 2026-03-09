import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/portal-auth',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isLoginPage = nextUrl.pathname.startsWith('/portal-auth');

            // 1. Protect Admin Routes
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                // Sneaky: Instead of bouncing unauthenticated users to the login screen,
                // we bounce them to the homepage so the portal-auth URL is never exposed.
                return Response.redirect(new URL('/', nextUrl));
            } 
            
            // 2. Protect Login Page
            if (isLoginPage && isLoggedIn) {
                return Response.redirect(new URL('/admin/', nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
