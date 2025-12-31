# Security Model Documentation

## Current Architecture (RLS-Based - Most Secure)

### Server-Side API Routes (`/api/*`)

- **Uses**: `anon` key + user's JWT token (RLS enforced)
- **Security**: Defense in depth - both application AND database enforce access
- **Verification**: `requireUser()` validates JWT token and extracts `userId`
- **RLS Policies**: Database-level security via Row Level Security policies
- **Function**: Security definer function `is_patient_shared_with_user()` handles shared access checks

### Client-Side (Browser)

- **Uses**: `anon` key with user's JWT token
- **Security**: RLS policies enforce access control
- **Protection**: Database-level security via RLS

## Security Benefits

### ✅ Defense in Depth:

1. **Application-Level Security**

   - JWT token validation on every request
   - User ID extracted and verified
   - Explicit `clinician_id` checks in application code

2. **Database-Level Security (RLS)**

   - RLS policies enforce access at the database level
   - Even if application code has bugs, database protects data
   - Policies check `auth.uid()` automatically

3. **Shared Access Handling**
   - Security definer function `is_patient_shared_with_user()` safely checks shared access
   - Avoids RLS subquery issues while maintaining security

## Security Features

✅ JWT token validation on every request  
✅ User ID extracted and verified before queries  
✅ RLS policies enforce access control at database level  
✅ Security definer function for shared access checks  
✅ Defense in depth: both application AND database enforce access  
✅ No service role key needed for patient operations (reduces attack surface)

## RLS Policies

### Patients Table

- **SELECT**: Users can view patients where `clinician_id = auth.uid()` OR patient is shared with them
- **INSERT**: Users can only insert patients with `clinician_id = auth.uid()`
- **UPDATE**: Users can update patients they own or that are shared with them
- **DELETE**: Users can only delete patients they own

### Implementation

- Uses `is_patient_shared_with_user()` function to check shared access
- Function runs with `SECURITY DEFINER` to bypass RLS for the check
- Avoids subquery issues while maintaining security

## Best Practices

1. **Always use user JWT tokens** - Never bypass RLS unless absolutely necessary
2. **Keep service role key secure** - Only use for operations that truly need it
3. **RLS policies are the source of truth** - Application code provides additional checks
4. **Regular security audits** - Review access patterns and RLS policies
5. **Monitor access logs** - Track all data access for anomalies
