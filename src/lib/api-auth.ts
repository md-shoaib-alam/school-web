import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyJWT } from "./jwt";

export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Validates the session OR JWT token and returns user data if authorized.
 * This enables both Web (Cookies) and Mobile (Bearer Token) authorization.
 */
export async function validateApiRequest() {
  // 1. Check for Next-Auth session (Web)
  const session = await getSession();
  if (session?.user) {
    const user = session.user as any;
    return { error: null, user, tenantId: user.tenantId };
  }

  // 2. Check for Authorization Header (Mobile/API)
  const authHeader = (await headers()).get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    
    if (payload) {
      return { 
        error: null, 
        user: payload, 
        tenantId: payload.tenantId 
      };
    }
  }

  // 3. Unauthorized
  return { 
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    user: null,
    tenantId: null 
  };
}
