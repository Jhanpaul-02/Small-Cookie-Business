import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_USER_ID } = process.env;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !ADMIN_USER_ID) {
  throw new Error(
    "SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and ADMIN_USER_ID must be set in server/.env",
  );
}

const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export async function requireAdmin(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Sign-in required." });
  }

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    return res.status(401).json({ message: "Sign-in required." });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired sign-in." });
    }

    if (user.id !== ADMIN_USER_ID) {
      return res.status(403).json({ message: "Admin access required." });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Admin access verification failed:", error.message);
    return res.status(503).json({ message: "Could not verify admin access." });
  }
}