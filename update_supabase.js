const fs = require('fs');

const filePath = 'src/services/supabase.ts';
let code = fs.readFileSync(filePath, 'utf8');

const targetRegex = /\/\/ Read from Vite env or localStorage override if admin entered them in the browser[\s\S]*?export const supabase = createClient\(supabaseUrl, supabaseAnonKey\);/;

const replacement = `// Read strictly from Vite environment variables (.env locally or Vercel Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables! Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or Vercel project settings.'
  );
}

// Fallback to placeholder to prevent client crash during initialization if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);`;

if (!targetRegex.test(code)) {
  console.error('Target snippet not found in ' + filePath);
  process.exit(1);
}

const updatedCode = code.replace(targetRegex, replacement);
fs.writeFileSync(filePath, updatedCode, 'utf8');
console.log('Successfully updated ' + filePath);

