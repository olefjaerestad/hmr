/**
 * I am just a dummy file that is being watched by HMR.
 * I am included in index.html and my only real purpose is to be watched by HMR.
 * When my contents are changed, HMR will notify connected browser clients.
 * Feel free to change my contents as much as you want.
 */
console.log('watchme.js', 1);
const x = 'helloworld';
const myObj = {};

for (let i = 0; i < 999999; ++i) {
  myObj[i] = x;
}

document.querySelector('h1').addEventListener('click', (e) => console.log(e));
