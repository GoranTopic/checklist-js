import path from 'node:path';
/*
 * if this is a path reconize if it is a file or a directory
 * if it is a file return the file name and the directory
 */

const parsePath = input => {
    const pathObj = path.parse(input);
    // check if the path could be parsed
    if(pathObj.name === input) throw new Error(`${input} path could not be parsed`);
    return pathObj;
}

export default parsePath;
