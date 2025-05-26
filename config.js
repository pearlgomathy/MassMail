const mysql = require("mysql");
const util = require("util");
require('dotenv').config();

const createDatabasePool = () => {
  const database = mysql.createPool({
    connectionLimit: 1000,
    host: process.env.DB_HOST,
    port: "3306",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Promisify the query method
  database.query = util.promisify(database.query).bind(database);

  // Function to handle connection errors with a retry mechanism
  const handleConnectionError = (err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Database connection error:`, err.code);

    // Log specific MySQL errors
    const errorMessages = {
      PROTOCOL_CONNECTION_LOST:
        "Database connection was closed. Reconnecting...",
      ER_CON_COUNT_ERROR: "Database has too many connections.",
      ECONNREFUSED: "Database connection was refused. Retrying...",
      PROTOCOL_PACKETS_OUT_OF_ORDER: "Packets out of order.",
      PROTOCOL_ENQUEUE_AFTER_FATAL: "Protocol enqueue after fatal error.",
    };

    console.error(
      `[${timestamp}] ${errorMessages[err.code] || "Unhandled database error."}`
    );

    // Retry the connection after a delay
    setTimeout(() => {
      console.log("Attempting to reconnect to the database...");
      database.getConnection((error, connection) => {
        if (error) {
          handleConnectionError(error); // Call recursively if another error occurs
        } else {
          console.log(
            `[${new Date().toISOString()}] Database reconnected successfully.`
          );
          connection.release();
        }
      });
    }, 5000); // Retry every 5 seconds
  };

  // Event listener for global connection pool errors
  database.on("error", handleConnectionError);

  // Test the connection on startup
  database.getConnection((err, connection) => {
    if (err) handleConnectionError(err);
    else {
      console.log(
        `[${new Date().toISOString()}] Database connected successfully.`
      );
      connection.release();
    }
  });

  return database;
};

// Create the database pool with retry logic
const database = createDatabasePool();

// Export the pool
module.exports = { database };
