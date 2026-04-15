import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'
import { getSession } from '@/lib/api-auth'
import { verifyJWT } from '@/lib/jwt'

const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    // 1. Try to get session from NextAuth (for web)
    const session = await getSession();
    
    // 2. Try to get token from Authorization header (for mobile/React Native)
    const authHeader = request.headers.get('authorization');
    let jwtPayload = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      jwtPayload = await verifyJWT(token);
    }

    const user = session?.user || jwtPayload;
    const tenantId = (user as any)?.tenantId;

    return {
      session,
      user,
      tenantId,
    };
  },
  // 🔒 Security: Only enable GraphiQL in development
  graphiql: process.env.NODE_ENV !== 'production',
  cors: {
    // 🔒 Security: Restrict CORS to same-origin only (no wildcard)
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    credentials: true,
  },
  // 🔒 Security: Mask errors in production to avoid leaking internals
  maskedErrors: process.env.NODE_ENV === 'production',
})

// Export handlers for Next.js App Router
export { yoga as GET, yoga as POST }
