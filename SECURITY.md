# NexArt Security Notes

## TODO: Enable Leaked Password Protection

Supabase Auth supports **leaked password protection** (HaveIBeenPwned integration)
that checks user passwords against known breached credential databases on signup and login.

**Where to enable:**
Supabase Dashboard → Authentication → Settings → Security → Enable "Leaked Password Protection"

**Why:**
Prevents users from signing up or logging in with passwords that appear in known data breaches,
reducing the risk of credential stuffing attacks.

**Status:** Not yet enabled. This should be turned on in the Supabase project settings.

---

## Applied Hotfixes

1. **db-health endpoint** — Requires `X-NEXART-ADMIN-SECRET` header; returns 404 without it.
2. **provision-key** — Stack traces and internal error details removed from client responses; kept in server logs.
3. **contact-submit** — Stricter validation (email regex, max lengths), HTML escaping, in-memory rate limiting (1 req/IP/min).
