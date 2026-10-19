// Public client configuration for accounts (safe to commit: the anon key is public by design,
// all data is protected by Row Level Security in the database).
// Leave the two values empty to run the game in guest mode (local save only).
window.MFB_CFG = {
  supabaseUrl: '',        // e.g. 'https://abcdxyz.supabase.co'
  supabaseAnonKey: '',    // the project's anon / publishable key (NEVER the service_role key)
  providers: ['google'],  // one-click OpenID Connect providers enabled in the Supabase dashboard
  magicLink: true,        // also offer "email me a sign-in link"
  policyVersion: '2026-10-19',
  legalUrl: 'legal.html'
};
