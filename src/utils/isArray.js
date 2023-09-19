const isArray = arrayValue => {
    /* this inner function check if paramter is an Array 
     * this is used to handle args which might be an array */
    return ( arrayValue && 
        (typeof arrayValue === 'object') && 
        (arrayValue.constructor === Array) );
}


export default isArray;
