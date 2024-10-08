import mysql from 'mysql';

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'petal_pink',
});

con.connect(function (err) {
    if (err) {
        console.log("Connection error: ", err);
    } else {
        console.log("Connected successfully.");
    }
});

export default con;