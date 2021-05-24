const db = require( './db/connection' );
const runInquirer = require( './src/runInquirer.js' );

    // connect to sql
db.connect( err => {
    if ( err ) throw err;
    console.log( 'Database connected' );
    runInquirer()
} );