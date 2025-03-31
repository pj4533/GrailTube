import mysql from 'mysql2/promise';
import logger from './logger';

// Log database configuration before connecting
logger.debug('Database configuration', {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  database: process.env.MYSQL_DATABASE || 'grailtube',
  // Log if any of these are undefined
  hostDefined: !!process.env.MYSQL_HOST,
  userDefined: !!process.env.MYSQL_USER,
  passwordDefined: !!process.env.MYSQL_PASSWORD,
  databaseDefined: !!process.env.MYSQL_DATABASE
});

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

// Log connection details (not passwords)
logger.debug('Database connection pool created', {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  database: process.env.MYSQL_DATABASE || 'grailtube',
  connectionLimit: 10
});

export async function query(sql: string, params: any[] = []) {
  logger.debug('Database query', { 
    sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
    paramCount: params.length 
  });

  try {
    // Get a connection from the pool to execute the query
    const connection = await pool.getConnection();
    logger.debug('Database connection acquired');
    
    try {
      // Execute the query with the connection
      const [results] = await connection.execute(sql, params);
      logger.debug('Database query executed successfully', { 
        rowCount: Array.isArray(results) ? results.length : 'unknown' 
      });
      
      // Return the connection to the pool
      connection.release();
      logger.debug('Database connection released');
      
      return results;
    } catch (error) {
      // Release connection on error
      connection.release();
      logger.error('Database query execution error', error);
      throw error;
    }
  } catch (error) {
    // This will catch connection errors
    logger.error('Database connection error', error);
    throw error;
  }
}

// Initialize the database by creating necessary tables
export async function initDatabase() {
  logger.info('Initializing database...');
  
  try {
    // Test the connection first
    const connection = await pool.getConnection();
    logger.info('Database connection successful');
    connection.release();
    
    // Create saved_videos table if it doesn't exist
    logger.debug('Creating saved_videos table if it doesn\'t exist');
    await query(`
      CREATE TABLE IF NOT EXISTS saved_videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_id VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(255) NOT NULL,
        channel_title VARCHAR(255) NOT NULL,
        channel_id VARCHAR(50),
        published_at DATETIME NOT NULL,
        view_count_at_discovery INT NOT NULL DEFAULT 0,
        discovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        duration VARCHAR(50)
      )
    `);
    
    // Verify the table was created by querying it
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = 'saved_videos'
    `, [process.env.MYSQL_DATABASE || 'grailtube']);
    
    if (Array.isArray(tables) && tables.length > 0) {
      logger.info('Database initialized successfully - saved_videos table exists');
      return true;
    } else {
      logger.error('Table creation appears to have failed');
      throw new Error('Table verification failed');
    }
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}