const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log(
    'Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local file'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database...')

  try {
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'setup-database.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')

    // Ejecutar el SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Error setting up database:', error)
      process.exit(1)
    }

    console.log('✅ Database setup completed successfully!')
    console.log('📊 Created tables: users, matches, challenges')
    console.log('👥 Inserted test users with emails')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setupDatabase()
