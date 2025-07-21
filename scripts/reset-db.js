const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetDatabase() {
  console.log('🔄 Resetting database...')

  try {
    // Eliminar todas las tablas
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS challenges CASCADE;
        DROP TABLE IF EXISTS matches CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `,
    })

    if (dropError) {
      console.error('❌ Error dropping tables:', dropError)
      process.exit(1)
    }

    console.log('✅ Database reset completed!')
    console.log('💡 Run "npm run db:setup" to recreate tables and data')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

resetDatabase()
