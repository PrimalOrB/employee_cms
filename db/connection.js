const mysql = require( 'mysql2' );

const db = mysql.createConnection( 
    {
        host: 'localhost',
        user: 'root',
        password: '7RiH6jx1OfO1', // remove for github pushing
        database: 'employee_cms',
    },
    console.log( 'Connected to the employee cms database' )
)

module.exports = db;