# API Contract & Authentication Standards

## Two Authentication Systems

### 1. User Authorization (Owner/Creator Auth)
- **Header**: `Authorization: Bearer {user_id}`
- **When**: User is managing their own campaigns
- **Used for**: Campaign CRUD, campaign-level operations
- **Frontend**: Managed by `useAuth` hook, handled automatically

### 2. Campaign Admin Token (Campaign Operator Auth)
- **Header**: `X-Token: {campaign_admin_token}`
- **When**: Performing operations within a campaign
- **Used for**: Character, Episode, Event, Layout operations
- **Frontend**: Must be explicitly captured and passed to API functions

---

## The Critical Rule

**ANY endpoint that starts with `/campaigns/{campaign_id}/` and performs CREATE/UPDATE/DELETE requires X-Token header.**

---

## Endpoint Reference

### CHARACTER ENDPOINTS
| Operation | Endpoint | Method | Auth Required | Frontend Param |
|-----------|----------|--------|---------------|---------------|
| List | `/campaigns/{id}/characters` | GET | ❌ No | - |
| Get | `/campaigns/{id}/characters/{cid}` | GET | ❌ No | - |
| **Create** | `/campaigns/{id}/characters` | POST | ✅ X-Token | `adminToken` |
| **Update** | `/campaigns/{id}/characters/{cid}` | PATCH | ✅ X-Token | `adminToken` |
| **Upload Image** | `/campaigns/{id}/characters/{cid}/image` | PATCH | ✅ X-Token | `adminToken` |
| **Delete** | `/campaigns/{id}/characters/{cid}` | DELETE | ✅ X-Token | `adminToken` |
| Set Color Override | `/campaigns/{id}/characters/{cid}/color-theme` | POST | ✅ X-Token | `adminToken` |
| Clear Color Override | `/campaigns/{id}/characters/{cid}/color-theme` | DELETE | ✅ X-Token | `adminToken` |

### EPISODE ENDPOINTS
| Operation | Endpoint | Method | Auth Required | Frontend Param |
|-----------|----------|--------|---------------|---------------|
| List | `/campaigns/{id}/episodes` | GET | ❌ No | - |
| Get | `/campaigns/{id}/episodes/{eid}` | GET | ❌ No | - |
| **Create** | `/campaigns/{id}/episodes` | POST | ✅ X-Token | `adminToken` |
| **Update** | `/campaigns/{id}/episodes/{eid}` | PATCH | ✅ X-Token | `adminToken` |
| **Delete** | `/campaigns/{id}/episodes/{eid}` | DELETE | ✅ X-Token | `adminToken` |

### EVENT ENDPOINTS
| Operation | Endpoint | Method | Auth Required | Frontend Param |
|-----------|----------|--------|---------------|---------------|
| List Campaign Events | `/campaigns/{id}/events` | GET | ❌ No | - |
| **Create Campaign Event** | `/campaigns/{id}/events` | POST | ✅ X-Token | `adminToken` |
| List Episode Events | `/episodes/{eid}/events` | GET | ✅ X-Token | `adminToken` |
| **Create Episode Event** | `/episodes/{eid}/events` | POST | ✅ X-Token | `adminToken` |
| **Update Episode Event** | `/episodes/{eid}/events/{eventid}` | PATCH | ✅ X-Token | `adminToken` |
| **Delete Episode Event** | `/episodes/{eid}/events/{eventid}` | DELETE | ✅ X-Token | `adminToken` |

### CHARACTER LAYOUT ENDPOINTS
| Operation | Endpoint | Method | Auth Required | Frontend Param |
|-----------|----------|--------|---------------|---------------|
| List Layouts | `/campaigns/{id}/character-layouts` | GET | ✅ X-Token | `adminToken` |
| Get Layout | `/campaigns/{id}/character-layouts/{lid}` | GET | ✅ X-Token | `adminToken` |
| **Create Layout** | `/campaigns/{id}/character-layouts` | POST | ✅ X-Token | `adminToken` |
| **Update Layout** | `/campaigns/{id}/character-layouts/{lid}` | PATCH | ✅ X-Token | `adminToken` |
| **Delete Layout** | `/campaigns/{id}/character-layouts/{lid}` | DELETE | ✅ X-Token | `adminToken` |

---

## Frontend Implementation Pattern

### Step 1: Capture Admin Token
Every page that performs admin operations MUST capture the admin token:

```typescript
const { campaigns } = useAuth();
const [adminToken, setAdminToken] = useState<string | null>(null);

useEffect(() => {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (campaign) {
    setAdminToken(campaign.admin_token);
  }
}, [campaignId, campaigns]);
```

### Step 2: Update API Function Signature
ALL admin operation functions must accept optional `adminToken`:

```typescript
// ❌ WRONG - No token parameter
export const createEpisode = async (data: CreateEpisodeData): Promise<Episode> => {
  const response = await apiClient.post(`/campaigns/${data.campaign_id}/episodes`, data);
  return response.data;
};

// ✅ CORRECT - Accepts admin token
export const createEpisode = async (
  data: CreateEpisodeData,
  adminToken?: string
): Promise<Episode> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.post(
    `/campaigns/${data.campaign_id}/episodes`,
    data,
    config
  );
  return response.data;
};
```

### Step 3: Pass Token on Every Admin Call
```typescript
// ❌ WRONG - No token passed
const episode = await createEpisode(data);

// ✅ CORRECT - Token passed explicitly
const episode = await createEpisode(data, adminToken || undefined);
```

---

## Checklist for New API Functions

When adding a new API function, ask these questions:

1. **Does it modify data?** (CREATE/UPDATE/DELETE)
   - YES → Requires `adminToken` parameter ✅
   - NO → Proceed to question 2

2. **Is it campaign-scoped?** (path contains `/campaigns/{id}/...`)
   - YES → Requires `adminToken` parameter ✅
   - NO → Proceed to question 3

3. **Is it user-scoped?** (creates/updates user's campaigns)
   - YES → Requires `Authorization` header (handled by `setAuthToken`) ✅
   - NO → Proceed to question 4

4. **Is it read-only public data?** (GET public endpoints)
   - YES → No auth required ✅
   - NO → Document the auth requirement

---

## Implementation Checklist for Pages

When creating a new admin page, follow this checklist:

- [ ] Import `useAuth` hook
- [ ] Call `useAuth()` to get `campaigns` list
- [ ] Create `adminToken` state
- [ ] Create `useEffect` to capture token from campaign
- [ ] For EVERY API call that modifies data, pass `adminToken || undefined`
- [ ] Test with Network tab to verify `X-Token` header is sent
- [ ] Add error handling for `403 Forbidden` (missing/invalid token)

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to Capture Token
```typescript
// NO TOKEN STATE - WILL FAIL
function EpisodeForm() {
  const handleCreate = async (data) => {
    await createEpisode(data); // ← No token!
  }
}
```

### ❌ Mistake 2: Function Doesn't Accept Token
```typescript
// API FUNCTION LACKS PARAMETER - WILL FAIL
export const createEpisode = async (data: CreateEpisodeData) => {
  // Can't pass token even if we wanted to!
  const response = await apiClient.post(`/campaigns/${data.campaign_id}/episodes`, data);
};
```

### ❌ Mistake 3: Token Captured But Not Passed
```typescript
// TOKEN EXISTS BUT NOT USED - WILL FAIL
const [adminToken, setAdminToken] = useState(null);
// ...
const episode = await createEpisode(data); // ← Token not passed!
```

### ✅ Correct Pattern
```typescript
// All three parts working together
const { campaigns } = useAuth();
const [adminToken, setAdminToken] = useState<string | null>(null);

useEffect(() => {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (campaign) {
    setAdminToken(campaign.admin_token);
  }
}, [campaignId, campaigns]);

const handleCreate = async (data) => {
  const episode = await createEpisode(data, adminToken || undefined);
};
```

---

## Testing Checklist

Before marking a feature complete:

1. **Open Network Tab** in browser dev tools
2. **Perform the action** (create/edit/delete)
3. **Find the API request**
4. **Check Request Headers** → Should see `X-Token: [token_value]`
5. **Check Response** → Should be `200 OK` or `201 Created`, NOT `401`/`403`

---

## Why This Happens

The "Missing X-Token header" error is caused by ANY of these:

| Cause | How to Fix |
|-------|-----------|
| Admin token state not captured | Add `useEffect` to capture from `campaigns` |
| API function lacks `adminToken` parameter | Add parameter to function signature |
| Function called without passing token | Pass `adminToken \|\| undefined` to call |
| Token captured but timing issue | Ensure token is captured BEFORE form submit |
| Frontend hasn't hot-reloaded | Hard refresh browser (Ctrl+Shift+R) |

---

## Prevention Going Forward

1. **Always use this checklist** when adding admin operations
2. **Test in Network tab** before considering feature complete
3. **Document admin requirements** in PR description
4. **Add TypeScript checks** to catch missing parameters at compile time
5. **Create integration tests** that verify X-Token is sent
