import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({entryPoints:[fileURLToPath(new URL('../firebase/gallery-client.js',import.meta.url))],outfile:fileURLToPath(new URL('../dist/vendor/firebase-gallery.js',import.meta.url)),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked'});
console.log('Firebase gallery browser module built');
