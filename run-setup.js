import { readFileSync } from 'fs'
import 'dotenv/config'

// Load from environment variables - NEVER hardcode credentials!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

async function runSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

async function setup() {
  console.log('🚀 Setting up Supabase database...\n')

  try {
    const sql = readFileSync('./setup-db.sql', 'utf8')
    console.log('📝 Executing SQL setup script...')

    await runSQL(sql)

    console.log('✅ Database setup complete!')
    console.log('\n🎉 Your website now has real data from Supabase')
    console.log('🌐 Refresh http://localhost:3000 to see the articles\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Manual Setup Instructions:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Click "SQL Editor" in the left sidebar')
    console.log('3. Click "New query"')
    console.log('4. Copy the contents of setup-db.sql')
    console.log('5. Paste and click "Run"\n')
  }
}

setup()
