const { pool } = require('./db');

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1',
    [tableName]
  );
  return rows.length > 0;
};

const initialCategories = [
  { name: 'Electrician', description: 'Electrical repair, wiring, and installation' },
  { name: 'Plumber', description: 'Plumbing fixtures, pipe leakages, and water line repair' },
  { name: 'Carpenter', description: 'Woodwork, furniture repair, and custom carpentry' },
  { name: 'AC Repair', description: 'Air conditioner servicing, gas refilling, and repairs' },
  { name: 'Appliance Repair', description: 'Washing machine, refrigerator, microwave repair' },
  { name: 'Bike Mechanic', description: 'Two-wheeler repair, tune-ups, and roadside servicing' },
  { name: 'Car Mechanic', description: 'Car breakdown assistance, periodic service, and engine checks' },
  { name: 'Puncture & Battery Help', description: 'Tyre puncture fixing and emergency battery jumpstart' },
  { name: 'Cleaning', description: 'Deep home cleaning, bathroom cleaning, and sanitation' },
  { name: 'Moving Help', description: 'House shifting, packing, and heavy lifting help' },
  { name: 'Grocery Pickup', description: 'Local supermarket grocery shopping and delivery' },
  { name: 'Medicine Pickup', description: 'Prescription pharmacy runs and doorstep medicine delivery' },
  { name: 'Elderly Assistance', description: 'Companionship, mobility aid, and errand support for seniors' },
  { name: 'Household Help', description: 'Daily domestic chores, cooking help, and assistance' },
  { name: 'Local Delivery', description: 'Quick point-to-point courier and document delivery' }
];

async function migrate() {
  console.log('--- Starting Day 3 Database Migration ---');
  const connection = await pool.getConnection();

  try {
    const usersTableExists = await tableExists(connection, 'users');
    if (!usersTableExists) {
      throw new Error('Required users table not found. Run the Day 1/2 schema migration before Day 3 migration.');
    }

    // 1. Create provider_profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS provider_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        business_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        description TEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        is_verified BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Checked/Created table: provider_profiles');

    // 2. Create service_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Checked/Created table: service_categories');

    // 3. Create provider_services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS provider_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        service_category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_service (provider_id, service_category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Checked/Created table: provider_services');

    // 4. Seed initial categories
    for (const cat of initialCategories) {
      await connection.query(
        'INSERT IGNORE INTO service_categories (name, description) VALUES (?, ?)',
        [cat.name, cat.description]
      );
    }
    console.log(`✓ Seeded ${initialCategories.length} standard service categories`);

    // Verify category count
    const [cats] = await connection.query('SELECT count(*) as count FROM service_categories');
    console.log(`✓ Total service categories in DB: ${cats[0].count}`);

    console.log('--- Day 3 Database Migration Completed Successfully ---');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrate };
