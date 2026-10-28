import {initializeApp} from 'firebase/app';
import {initializeAppCheck,ReCaptchaEnterpriseProvider,getToken} from 'firebase/app-check';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,browserSessionPersistence,setPersistence,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,collection,doc,getDoc,getDocs,query,where,orderBy,limit,startAfter,startAt,endAt,runTransaction,serverTimestamp,updateDoc,deleteDoc,setDoc,connectFirestoreEmulator} from 'firebase/firestore';
import {categories,resolve,sanitizeBuild} from '../dist/catalog.js';
import {compatibility,summarizePrices} from '../dist/engine.js';
import {sanitizeFanLayout} from '../dist/fan-layout.js';
import {sanitizeLighting} from '../dist/lighting.js';
import {priceSnapshot,regionFor} from '../dist/regions.js';
import {requireAppCheckToken} from './app-check-guard.js';
const clean=(s,min,max,label)=>{if(typeof s!=='string'||s.trim().length<min||s.trim().length>max)throw Error('Проверь поле «'+label+'».');return s.trim();};
let appCheck;
export function publication(input){const build=sanitizeBuild(input.build);if(categories.some(([k])=>!build[k]||build[k]!==input.build[k])||!compatibility(build).ready)throw Error('Для публикации нужны все 8 совместимых компонентов.');return {title:clean(input.title,3,80,'Название'),description:clean(input.description||'',0,800,'Описание'),build,fanLayout:Object.fromEntries(sanitizeFanLayout(build,input.fanLayout).map(f=>[f.slot,f.direction])),lighting:sanitizeLighting(input.lighting),region:regionFor(input.region).id};}
export async function createFirebaseGallery(config,{emulators=false,persistence=browserSessionPersistence}={}){
 if(!config?.projectId||!config?.apiKey)throw Error('Подключение публичной галереи Firebase ещё настраивается.');
 const app=initializeApp(config,'pcmaker-gallery');
 // Production attestation must start before Auth/Firestore. Local development
 // connects only to the demo emulators and never uses production debug tokens.
 if(!emulators){
  if(!config.appCheckSiteKey)throw Error('Защита Маркета ещё настраивается. Попробуй позже.');
  appCheck||=initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(config.appCheckSiteKey),isTokenAutoRefreshEnabled:true});
  await requireAppCheckToken(()=>getToken(appCheck));
 }
 const auth=getAuth(app),db=getFirestore(app);auth.languageCode='ru';
 if(emulators){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);}
 await setPersistence(auth,persistence);await auth.authStateReady();
 const snapshots=Object.fromEntries(await Promise.all(['ru','by'].map(async id=>[id,priceSnapshot(await fetch(id==='by'?'./prices-by.json':'./prices.json').then(r=>r.json()),id)])));const cursors=new Map();let admin=false;
 const publicUser=async()=>{const u=auth.currentUser;if(!u)return null;admin=!!(await u.getIdTokenResult()).claims.admin;return {id:u.uid,displayName:u.displayName||'Автор',username:'Google',admin};};
 const ready=()=>{if(!auth.currentUser)throw Error('Войди через Google.');return auth.currentUser;};
 const dataCard=s=>{const d=s.data(),region=regionFor(d.region),build=sanitizeBuild(d.build);return {id:s.id,...d,build,fanLayout:Object.entries(d.fanLayout||{}).map(([slot,direction],i)=>({id:'fan'+(i+1),slot,direction})),author:{id:d.authorId,name:d.authorName,username:''},createdAt:d.createdAt?.toMillis()||Date.now(),updatedAt:d.updatedAt?.toMillis()||Date.now(),price:{...summarizePrices(build,snapshots[region.id].items),currency:region.currency,checkedAt:snapshots[region.id].checkedAt},compatible:compatibility(build).ready};};
 async function request(path,method='GET',data){
  const url=new URL(path,'https://pcmaker.local');
  if(path==='/me')return {user:await publicUser()};
  if(path==='/auth/google'){const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});let timer;try{await Promise.race([signInWithPopup(auth,provider),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Заверши вход в окне Google. Если окно не появилось, открой PCmaker в Chrome или Edge и повтори вход.')),45000);})]);}finally{clearTimeout(timer);}return {user:await publicUser()};}
  if(path==='/auth/logout'){await signOut(auth);admin=false;return {ok:true};}
  if(url.pathname==='/builds'&&method==='GET'){
   const mine=url.searchParams.get('mine')==='1',search=(url.searchParams.get('q')||'').trim().toLowerCase(),region=url.searchParams.get('region'),sort=url.searchParams.get('sort')||'newest',offset=Number(url.searchParams.get('offset')||0),owner=mine?ready().uid:false;
   const key=JSON.stringify([owner,search,region,sort]),cursor=cursors.get(key+':'+offset);
   if(!Number.isSafeInteger(offset)||offset<0||offset>0&&!cursor)throw Error('Обнови список сборок и повтори загрузку.');
   const clauses=[where(mine?'authorId':'hidden','==',owner)];
   if(['ru','by'].includes(region))clauses.push(where('region','==',region));
   clauses.push(orderBy(search||sort==='name'?'titleKey':'createdAt',search||['name','oldest'].includes(sort)?'asc':'desc'));
   if(search){if(!cursor)clauses.push(startAt(search));clauses.push(endAt(search+'\uf8ff'));}
   if(cursor)clauses.push(startAfter(cursor));
   const rows=await getDocs(query(collection(db,'builds'),...clauses,limit(25))),shown=rows.docs.slice(0,24);
   if(cursors.size>200)cursors.clear();if(shown.length)cursors.set(key+':'+(offset+shown.length),shown.at(-1));
   return {items:shown.map(dataCard),hasMore:rows.size>24};
  }
  if(path==='/builds'&&method==='POST'){
   const u=ready(),p=publication(data),ref=doc(collection(db,'builds')),quota=doc(db,'publishLimits',u.uid);
   await runTransaction(db,async tx=>{const snap=await tx.get(quota),before=snap.exists()?snap.data():{count:0,lastPublish:null};if(before.count>=50)throw Error('Лимит первой версии — 50 публикаций на аккаунт. Можно редактировать существующие.');if(before.lastPublish&&Date.now()-before.lastPublish.toMillis()<10000)throw Error('Подожди 10 секунд между публикациями.');
    tx.set(ref,{...p,titleKey:p.title.toLowerCase(),authorId:u.uid,authorName:(u.displayName||'Автор').slice(0,40),createdAt:serverTimestamp(),updatedAt:serverTimestamp(),hidden:false});
    tx.set(quota,{count:before.count+1,lastPublish:serverTimestamp(),lastBuildId:ref.id});
   });return {id:ref.id};
  }
  const match=url.pathname.match(/^\/builds\/([A-Za-z0-9_-]{1,80})(?:\/(report|moderate))?$/);
  if(match){const ref=doc(db,'builds',match[1]);
   if(method==='GET'){const snap=await getDoc(ref);if(!snap.exists())throw Error('Сборка не найдена.');return dataCard(snap);}
   const u=ready();
   if(match[2]==='report'){await setDoc(doc(db,'reports',match[1]+'_'+u.uid),{buildId:match[1],authorId:u.uid,reason:clean(data.reason,5,400,'Причина жалобы'),createdAt:serverTimestamp()});return {ok:true};}
   if(match[2]==='moderate'){await updateDoc(ref,{hidden:data.hidden!==false});return {ok:true};}
   if(method==='PUT'){const p=publication(data);await updateDoc(ref,{...p,titleKey:p.title.toLowerCase(),updatedAt:serverTimestamp()});return {ok:true};}
   if(method==='DELETE'){await deleteDoc(ref);return {ok:true};}
  }
  if(path==='/reports'){ready();if(!admin)throw Error('Недостаточно прав.');const rows=await getDocs(query(collection(db,'reports'),orderBy('createdAt','desc'),limit(100)));return {items:rows.docs.map(s=>({...s.data(),id:s.id,build_id:s.data().buildId,title:'Публикация '+s.data().buildId}))};}
  throw Error('Неизвестное действие.');
 }
 return {async call(...args){try{return await request(...args);}catch(err){const messages={'auth/popup-blocked':'Браузер заблокировал окно Google. Разреши всплывающее окно для PCmaker.','auth/popup-closed-by-user':'Вход отменён.','auth/cancelled-popup-request':'Вход отменён.','auth/unauthorized-domain':'Этот домен ещё не добавлен в Firebase Authentication.','permission-denied':'Нет доступа к этой операции. Проверь вход, совместимость и лимит публикаций. Повторную жалобу отправить нельзя.','resource-exhausted':'Бесплатный лимит Firebase временно исчерпан. Попробуй позже.','unavailable':'Нет связи с сервером. Проверь интернет.','failed-precondition':'Этот список пока недоступен. Попробуй обновить его чуть позже.'};throw Error(messages[err.code]||err.message);}}};
}
