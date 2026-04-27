import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        if (isAdminRoute) {
          return token?.email === process.env.ADMIN_EMAIL;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};