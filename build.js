const fs = require('fs');

// Get environment variables or use defaults from example
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const table = process.env.SUPABASE_TABLE || 'gratitude_notes';

// Generate backend.config.js from environment variables
const configContent = `// Auto-generated from environment variables during build
// The anon key is safe to ship when Row Level Security policies restrict access.
window.BACKEND_CONFIG = {
  supabaseUrl: "${supabaseUrl}",
  supabaseAnonKey: "${supabaseAnonKey}",
  table: "${table}",
};
`;

// Write the config file
fs.writeFileSync('backend.config.js', configContent, 'utf8');

console.log('✓ Generated backend.config.js from environment variables');

// Validate that required variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠ Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set. App will run in local-only mode.');
}
