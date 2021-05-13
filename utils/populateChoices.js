module.exports = ( arr, rows ) => {
    rows.forEach( entry => arr.push( Object.values(entry)[1] ) );
    return arr
};