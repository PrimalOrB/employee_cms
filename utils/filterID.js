module.exports = ( arr, arg ) => {
    const output = arr.filter( x => x.name === arg )
    return output[0].id
};