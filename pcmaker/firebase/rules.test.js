import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,query,where,limit,writeBatch,serverTimestamp,updateDoc,deleteDoc,Timestamp,setLogLevel} from 'firebase/firestore';
import {demoBuild,catalog} from '../dist/catalog.js';
import {defaultFanLayout} from '../dist/fan-layout.js';
setLogLevel('silent');
const google={email_verified:true,firebase:{sign_in_provider:'google.com'}};
test('Firestore protects ownership, published data, catalog integrity, quotas and reports',async t=>{
 const env=await initializeTestEnvironment({projectId:'demo-pcmaker-rules',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(new URL('./firestore.rules',import.meta.url),'utf8')}});t.after(()=>env.cleanup());await env.clearFirestore();
 await env.withSecurityRulesDisabled(async context=>{const db=context.firestore(),batch=writeBatch(db);for(const [id,facts] of Object.entries(JSON.parse(fs.readFileSync(new URL('./catalog-facts.json',import.meta.url),'utf8'))))batch.set(doc(db,'catalog',id),facts);await batch.commit();});
 const alice=env.authenticatedContext('alice',google).firestore(),bob=env.authenticatedContext('bob',google).firestore(),admin=env.authenticatedContext('moderator',{...google,admin:true}).firestore(),guest=env.unauthenticatedContext().firestore(),unverified=env.authenticatedContext('unverified',{...google,email_verified:false}).firestore();
 const payload={title:'Сборка для школы',titleKey:'сборка для школы',description:'Тестовый текст',build:demoBuild,fanLayout:Object.fromEntries(defaultFanLayout(demoBuild).map(f=>[f.slot,f.direction])),lighting:{mode:'color',color:'#bba1ff'},region:'ru',authorId:'alice',authorName:'Автор',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),hidden:false};
 async function create(db,id='fixture',changes={},count=1){const batch=writeBatch(db);batch.set(doc(db,'builds',id),{...payload,...changes});batch.set(doc(db,'publishLimits',changes.authorId||'alice'),{count,lastBuildId:id,lastPublish:serverTimestamp()});return batch.commit();}
 await assertFails(setDoc(doc(alice,'catalog','cpu-test'),{category:'cpu'}));await assertFails(create(guest));await assertFails(create(unverified,'bad',{authorId:'unverified'}));await assertFails(setDoc(doc(alice,'builds','no-quota'),payload));await assertSucceeds(create(alice));
 await assertFails(create(alice,'spam',{},2));await assertFails(updateDoc(doc(alice,'publishLimits','alice'),{count:0}));
 await assertSucceeds(getDoc(doc(guest,'builds','fixture')));await assertSucceeds(getDocs(query(collection(guest,'builds'),where('hidden','==',false),limit(25))));await assertFails(getDocs(collection(guest,'builds')));
 await assertFails(updateDoc(doc(bob,'builds','fixture'),{title:'Чужая',titleKey:'чужая',updatedAt:serverTimestamp()}));await assertFails(deleteDoc(doc(bob,'builds','fixture')));
 await assertSucceeds(updateDoc(doc(alice,'builds','fixture'),{title:'Обновление',titleKey:'обновление',updatedAt:serverTimestamp()}));
 for(const change of [{authorId:'bob'},{hidden:true},{price:1},{build:{...demoBuild,ram:'ddr4-32'}},{build:{...demoBuild,cpu:'rtx4060'}},{build:{...demoBuild,cooler:'aio-le360-v2',case:'pop-air'}},{description:'x'.repeat(801)},{lighting:{mode:'hack',color:'#000000'}}])await assertFails(updateDoc(doc(alice,'builds','fixture'),{...change,updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(doc(alice,'builds','fixture'),{build:{...demoBuild,cooler:'aio-le240-v2'},updatedAt:serverTimestamp()}));
 const report={buildId:'fixture',authorId:'bob',reason:'Проверка жалобы',createdAt:serverTimestamp()};await assertSucceeds(setDoc(doc(bob,'reports','fixture_bob'),report));await assertFails(setDoc(doc(bob,'reports','fixture_bob'),report));await assertFails(getDoc(doc(alice,'reports','fixture_bob')));await assertSucceeds(getDocs(query(collection(admin,'reports'),limit(100))));
 await assertSucceeds(updateDoc(doc(admin,'builds','fixture'),{hidden:true}));await assertFails(getDoc(doc(guest,'builds','fixture')));await assertSucceeds(getDoc(doc(alice,'builds','fixture')));await assertFails(updateDoc(doc(alice,'builds','fixture'),{hidden:false,updatedAt:serverTimestamp()}));
 await assertSucceeds(deleteDoc(doc(alice,'builds','fixture')));
 // Quota and content are bound atomically; a fabricated quota document cannot grant writes.
 await assertFails(setDoc(doc(bob,'publishLimits','bob'),{count:1,lastBuildId:'missing',lastPublish:serverTimestamp()}));
 await env.withSecurityRulesDisabled(async context=>{await setDoc(doc(context.firestore(),'publishLimits','bob'),{count:50,lastBuildId:'old',lastPublish:Timestamp.fromMillis(0)});});await assertFails(create(bob,'over-limit',{authorId:'bob'},51));
});
