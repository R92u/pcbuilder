import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const project=process.argv[2];
if(!project||!/^([a-z][a-z0-9-]+)$/.test(project))throw Error('Pass the target Firebase project ID.');
const emulator=project.startsWith('demo-');
const encode=v=>Array.isArray(v)?{arrayValue:{values:v.map(encode)}}:typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?(Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}):{stringValue:v};
const facts=JSON.parse(fs.readFileSync(new URL('./catalog-facts.json',import.meta.url),'utf8'));
let token='owner';
if(!emulator){const auth=require('firebase-tools/lib/auth.js'),account=auth.getGlobalDefaultAccount();if(!account)throw Error('Run firebase login first.');token=(await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase'])).access_token;}
const base=`projects/${project}/databases/(default)/documents`;
const writes=Object.entries(facts).map(([id,f])=>({update:{name:`${base}/catalog/${id}`,fields:Object.fromEntries(Object.entries(f).map(([k,v])=>[k,encode(v)]))}}));
const response=await fetch(`${emulator?'http://127.0.0.1:8080':'https://firestore.googleapis.com'}/v1/${base}:commit`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({writes})});
if(!response.ok)throw Error(`Catalog upload failed (${response.status}): ${await response.text()}`);
console.log(`Trusted catalog: ${writes.length} products uploaded to ${project}.`);
