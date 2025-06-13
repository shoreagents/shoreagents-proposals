# Authentication Setup

This application uses Supabase for authentication. Follow these steps to set up authentication:

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Supabase Configuration

1. Create a new project in [Supabase](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Add these values to your `.env.local` file

## 3. User Management

Since this application uses a sign-in only approach, you'll need to add users directly in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add user" to manually add users
4. Users can then sign in using the `/signin` page

## 4. Authentication Features

- **Protected Routes**: All main routes are protected and redirect to `/signin` if not authenticated
- **Sign-in Page**: Located at `/signin` with email/password authentication
- **Auto-redirect**: Users are automatically redirected after successful sign-in
- **Session Management**: Sessions are automatically managed and persisted
- **Sign-out**: Users can sign out using the header button

## 5. Route Protection

The following routes are protected:
- `/` (Home page)
- `/preview/[filename]` (Preview pages)
- `/[slug]` (Component pages)

The `/signin` route is public and accessible to unauthenticated users.

## 6. Development

For development, make sure to:
1. Set up your `.env.local` file with valid Supabase credentials
2. Add at least one user in your Supabase dashboard
3. Test the sign-in flow before deploying 