# Panduan Deploy Edge Functions ke Vercel

## Struktur File

Edge Functions di Vercel menggunakan folder `api/` di root project:

```
apptagihanwina/
├── api/
│   └── manage-users.ts          # Edge Function untuk manage users
├── src/
├── supabase/                     # Jadikan backup saja
│   └── functions/                # (tidak digunakan di Vercel)
├── package.json
├── vercel.json
└── tsconfig.json
```

## Step-by-Step Deploy

### 1. Install Vercel CLI (Optional, untuk testing lokal)

```bash
npm install -g vercel
```

### 2. Update package.json

Pastikan dependencies untuk Vercel Edge Functions sudah ada:

```json
{
  "dependencies": {
    "@vercel/node": "^3.0.0",
    "@supabase/supabase-js": "^2.50.0"
  }
}
```

Jalankan:
```bash
npm install
```

### 3. Update vercel.json

Konfigurasi untuk Vercel:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_project_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

### 4. Set Environment Variables di Vercel Dashboard

**Login ke Vercel:**
- https://vercel.com
- Select project: apptagihanwina
- Settings > Environment Variables

**Tambahkan secrets berikut:**

| Variable | Value |
|----------|-------|
| SUPABASE_URL | https://dvecuxqozqxbgjgyxqpn.supabase.co |
| SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2ZWN1eHFvenF4YmdqZ3l5cXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDk3NTIsImV4cCI6MjA5MzkyNTc1Mn0.uWPO3oDBS_H_MVwcYHvEk7abCtA9cXmTx_sC7EA36hc |
| SUPABASE_SERVICE_ROLE_KEY | sb_secret_xhzEVWUWBk2-5KcBEqvSRw_BXCkLbBp |
| VAPID_PUBLIC_KEY | [sesuaikan] |
| VAPID_PRIVATE_KEY | [sesuaikan] |
| VAPID_SUBJECT | [sesuaikan] |
| LOVABLE_API_KEY | [sesuaikan] |

### 5. Deploy ke Vercel

**Opsi A: Via Git Push (Recommended)**
```bash
git add .
git commit -m "Deploy Edge Functions to Vercel"
git push origin main
```

Vercel otomatis detect dan deploy.

**Opsi B: Via Vercel CLI**
```bash
vercel deploy --prod
```

### 6. Verifikasi Deployment

Setelah deploy, Edge Function akan tersedia di:

```
https://apptagihanwina.vercel.app/api/manage-users
```

Test dengan curl:
```bash
curl -X OPTIONS https://apptagihanwina.vercel.app/api/manage-users
# Should return 204
```

### 7. Update Client Code

Client harus invoke functions dari Vercel endpoint, bukan Supabase:

**Old (Supabase):**
```typescript
const { data, error } = await supabase.functions.invoke('manage-users', {
  body: { action: 'create', ... }
});
```

**New (Vercel):**
```typescript
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch('/api/manage-users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'create', ... })
});
const data = await response.json();
```

atau gunakan helper:

```typescript
async function invokeEdgeFunction(action: string, payload: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('/api/manage-users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, ...payload })
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
```

### 8. Monitoring & Logs

**View logs di Vercel Dashboard:**
- Settings > Functions > manage-users > View logs

**Local testing:**
```bash
vercel dev
# Runs on localhost:3000
# Functions at localhost:3000/api/manage-users
```

## Troubleshooting

| Error | Solusi |
|-------|--------|
| 401 Unauthorized | Check SUPABASE_SERVICE_ROLE_KEY di env vars |
| 403 Forbidden | User bukan admin, check roles di database |
| 500 Internal Error | Check error log di Vercel dashboard |
| CORS error | Verify corsHeaders di api/manage-users.ts |

## Security Notes

⚠️ Edge Functions di Vercel:
- Berjalan di Node.js runtime, bukan browser
- Environment variables terlindungi, tidak terekspos
- Tetap gunakan JWT verification untuk authorization
- Rate limiting perlu dikonfigurasi di Vercel atau middleware

## Next Steps

1. ✅ Migrate `api/manage-users.ts` (sudah dibuat)
2. Update Client code untuk invoke dari `/api/manage-users`
3. Set environment variables di Vercel dashboard
4. Deploy via git push
5. Test dengan admin user
6. Monitor logs di Vercel dashboard
