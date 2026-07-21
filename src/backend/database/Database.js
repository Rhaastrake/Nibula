'use strict';

/**
 * Mirror of src/backend/database/Database.php
 *
 * PDO singleton → a single shared mysql2 connection pool. Config is read from
 * ../config.js (same relative location as the PHP version's ../config.php).
 * Options map the PDO attributes as closely as mysql2 allows:
 *   - ERRMODE_EXCEPTION      → mysql2 rejects/throws on error by default
 *   - FETCH_ASSOC            → rowsAsArray:false (objects keyed by column) is default
 *   - EMULATE_PREPARES false → native prepared statements via pool.execute()
 *
 * Requires the "mysql2" package (npm install mysql2). getInstance() returns the
 * promise-based pool; use pool.execute(sql, params) for prepared statements.
 */

const path = require('path');

let instance = null;

class Database {
    static getInstance() {
        if (instance === null) {
            // Lazy require so the backend boots even without a DB configured.
            // eslint-disable-next-line global-require
            const mysql = require('mysql2/promise');

            // eslint-disable-next-line global-require
            const config = require(path.join(__dirname, '..', 'config.js'));

            instance = mysql.createPool({
                host: config.DB_HOST,
                database: config.DB_NAME,
                user: config.DB_USER,
                password: config.DB_PASS,
                charset: 'utf8mb4',
                waitForConnections: true,
                connectionLimit: 10,
                namedPlaceholders: false,
            });
        }
        return instance;
    }
}

module.exports = Database;
