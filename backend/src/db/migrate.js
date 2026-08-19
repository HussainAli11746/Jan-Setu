import pool from './pool.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        name_hi VARCHAR(200),
        ministry VARCHAR(200),
        category VARCHAR(50),
        benefit_description TEXT,
        benefit_amount VARCHAR(100),
        eligibility_rules JSONB,
        required_documents JSONB,
        form_fields JSONB,
        application_url VARCHAR(500),
        deadline DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        language VARCHAR(10) DEFAULT 'en',
        current_step INTEGER DEFAULT 1,
        user_profile JSONB DEFAULT '{}',
        matched_scheme_ids TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES user_sessions(session_id),
        scheme_id VARCHAR(50) REFERENCES schemes(id),
        status VARCHAR(50) DEFAULT 'submitted',
        reference_number VARCHAR(100) UNIQUE,
        submitted_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        status_history JSONB DEFAULT '[]',
        form_data JSONB DEFAULT '{}'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID,
        event_type VARCHAR(100),
        scheme_id VARCHAR(50),
        document_types TEXT[],
        consent_given BOOLEAN,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      );
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
