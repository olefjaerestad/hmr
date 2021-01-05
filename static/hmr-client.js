import { Client } from '../dist/exports/client.js';

// TODO: This script doesn't rerun in browser when changed. watchme.js does.
// Seems to have to do with type="module".
// Further reading:
// https://www.google.com/search?q=js+insert+module+script+dynamically&oq=js+insert+module+script+dynamically&aqs=chrome..69i57j33i22i29i30.6663j0j7&sourceid=chrome&ie=UTF-8
// https://www.google.com/search?sxsrf=ALeKk01Def_N9Qxr16ftL3XEw7eI05caUw%3A1609871885410&ei=DbL0X8zEGJfX3APPjra4CA&q=js+insert+script+tag+and+run+module&oq=js+insert+script+tag+and+run+module&gs_lcp=CgZwc3ktYWIQAzIFCCEQoAE6BwgjEK4CECc6BAghEBU6BAgjECdQ_f_vAligovACYOql8AJoBHAAeACAAb0BiAGjCpIBAzYuNpgBAKABAaoBB2d3cy13aXrAAQE&sclient=psy-ab&ved=0ahUKEwiM__OOuIXuAhWXK3cKHU-HDYcQ4dUDCAw&uact=5
// https://stackoverflow.com/questions/53178938/dynamically-loading-a-module-that-is-not-in-a-script-tag-with-type-module
// https://jakearchibald.com/2017/es-modules-in-browsers/
// https://v8.dev/features/dynamic-import
// https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
console.log('hmrclient 1');

new Client({
  hostname: 'localhost',
  port: 9001,
  // onMessageCallback: (e, client) => {
  //   console.log('Client.onMessageCallback()');
  //   console.log(e);
  //   client.replaceNodeByFilename(e.filename);
  // },
  onOpenCallback: (e) => console.log(e),
  onCloseCallback: (e) => console.log(e),
  onErrorCallback: (e) => console.log(e),
});
