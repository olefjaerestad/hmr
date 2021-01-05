// TODO: When this script reruns in the browser it throws an 
// `Uncaught SyntaxError: Identifier 'xyz' has already been declared` error.
// Seems old variables aren't deleted despite script tag being removed.
const xyz = 9;
console.log({xyz});
