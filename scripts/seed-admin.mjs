import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const fullName = process.env.SEED_ADMIN_FULL_NAME ?? "Admin";

if (!url || !serviceKey || !email || !password) {
  console.error(
    "Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName }
});

if (createError && !createError.message.toLowerCase().includes("already")) {
  console.error(createError.message);
  process.exit(1);
}

let userId = created?.user?.id;
if (!userId) {
  const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(listError.message);
    process.exit(1);
  }
  userId = listUsers.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
}

if (!userId) {
  console.error("Unable to resolve admin user id");
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  role: "admin",
  full_name: fullName
});

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

console.log(`Admin ready: ${email} (${userId})`);
