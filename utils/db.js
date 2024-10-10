import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'petal_pink'
});

export default db;