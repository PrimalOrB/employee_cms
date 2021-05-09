const express = require( 'express' );
const app = express();
const PORT = process.env.PORT || 3001;
const db = require( './db/connection' );
const runInquirer = require( './src/runInquirer.js' );

app.use( express.urlencoded( {extended: false} ) );
app.use( express.json() );

    // catch all 404 error
app.use( ( req, res ) => {
    res.status( 404 ).end();
});

    // connect to sql
db.connect( err => {
    if ( err ) throw err;
    console.log( 'Database connected' );
    app.listen( PORT, () => {
        console.log( `Server running on port ${PORT}` );
            // once connection made, launch the inquirer prompts
        runInquirer()
    } );
} );