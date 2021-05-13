module.exports = ( arr, rows ) => {
    rows.forEach( entry => arr.push( {id: Object.values(entry)[0], name: Object.values(entry)[1] } ) )
    return arr
};