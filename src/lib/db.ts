import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'grailtube',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize the database by creating necessary tables
export async function initDatabase() {
  try {
    // Create saved_videos table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS saved_videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_id VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(255) NOT NULL,
        channel_title VARCHAR(255) NOT NULL,
        published_at DATETIME NOT NULL,
        view_count_at_discovery INT NOT NULL DEFAULT 0,
        discovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        duration VARCHAR(50)
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}