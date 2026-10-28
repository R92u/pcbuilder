import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const result=await build({entryPoints:[fileURLToPath(new URL('../firebase/gallery-client.js',import.meta.url))],outfile:fileURLToPath(new URL('../dist/vendor/firebase-gallery.js',import.meta.url)),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked',metafile:true});
const root=fileURLToPath(new URL('../',import.meta.url)),hashes={};
for(const input of [...Object.keys(result.metafile.inputs),fileURLToPath(new URL('../dist/vendor/firebase-gallery.js',import.meta.url)),fileURLToPath(new URL('../pnpm-lock.yaml',import.meta.url))]){
 const full=path.resolve(input),relative=path.relative(root,full).replaceAll('\\','/');
 if(relative.startsWith('..')||relative.includes('node_modules/'))continue;
 hashes[relative]=createHash('sha256').update(fs.readFileSync(full,'utf8').replace(/\r\n/g,'\n')).digest('hex');
}
fs.writeFileSync(new URL('../firebase/bundle-manifest.json',import.meta.url),JSON.stringify(hashes,null,2)+'\n');
console.log('Firebase gallery browser module built');
