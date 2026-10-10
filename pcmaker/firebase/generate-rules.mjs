import fs from 'node:fs';
import {catalog} from '../dist/catalog.js';
import {radiatorSupport} from '../dist/aio.js';
const pick={cpu:p=>({socket:p.socket,memory:[p.memory].flat(),power:p.peakPower}),motherboard:p=>({socket:p.socket,memory:p.memory,maxRam:p.maxRam,slots:p.slots,form:p.form}),ram:p=>({memory:p.memory,capacity:p.capacity,modules:p.modules,height:p.height||0}),gpu:p=>({length:p.length,power:p.power,psu:p.recommendedPsu||0,pins:p.connectorType==='16pin',connectors:p.connectors||0}),cooler:p=>({socket:p.sockets,height:p.height,clearance:p.ramClearance||999,adjust:!!p.adjustableFrontFan,unlimited:!!p.ramUnrestricted,sockets:p.ramUnrestrictedSockets||[],aio:p.type==='aio',radiator:p.radiator||0,thickness:p.radiatorDimensions?.[2]||0}),psu:p=>({watts:p.watts,length:p.length,pins:!!p.connector16pin,pinWatts:p.connector16pinWatts||9999,connectors:p.connectors||0}),case:p=>({forms:p.forms,gpu:p.gpuLimit,cooler:p.coolerLimit,psu:p.psuLimit||9999,top:radiatorSupport[p.id]?.top||(p.concept==='dual'?[240,360]:[]),front:radiatorSupport[p.id]?.front||[],ram:p.id.startsWith('pop-air')?46:9999})};
pick.storage = () => ({});
const facts=Object.fromEntries(Object.entries(catalog).flatMap(([category,ps])=>ps.map(p=>[p.id,{category,...pick[category](p)}])));
fs.writeFileSync(new URL('catalog-facts.json',import.meta.url),JSON.stringify(facts,null,2));
const functions=`function part(id) {return get(/databases/$(database)/documents/catalog/$(id)).data;}
function knownBuild(b) {return b is map && b.keys().hasAll(${JSON.stringify(Object.keys(catalog))}) && b.keys().hasOnly(${JSON.stringify(Object.keys(catalog))}) && ${Object.keys(catalog).map(k=>`b.${k} is string && b.${k}.size()<=100`).join(' && ')};}`;
const rules=`rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
 function signed() {return request.auth != null && request.auth.token.firebase.sign_in_provider == 'google.com' && request.auth.token.email_verified == true;}
 function admin() {return request.auth != null && request.auth.token.get('admin', false) == true;}
 ${functions}
 function max(a,b){return a > b ? a : b;}
 function fits(b) {
  let c=part(b.cpu);let m=part(b.motherboard);let r=part(b.ram);let g=part(b.gpu);let h=part(b.cooler);let p=part(b.psu);let box=part(b.case);
  let clear=h.unlimited || c.socket in h.sockets || r.height<=h.clearance;
  let extra=h.adjust && !clear ? r.height-h.clearance : 0;
  return c.category=='cpu' && m.category=='motherboard' && r.category=='ram' && g.category=='gpu' && h.category=='cooler' && p.category=='psu' && box.category=='case' && part(b.storage).category=='storage' && c.socket==m.socket && r.memory==m.memory && r.memory in c.memory && r.capacity<=m.maxRam && r.modules<=m.slots && m.form in box.forms && g.length<=box.gpu && c.socket in h.socket && h.height+extra<=box.cooler && (clear || h.adjust) && p.length<=box.psu && (g.pins ? p.pins && g.power<=p.pinWatts : g.connectors<=p.connectors) && p.watts>=math.ceil(max((c.power + g.power + 65) * 1.2,g.psu) / 50) * 50 && (!h.aio || (h.radiator in box.top ? r.height<=box.ram : h.radiator in box.front && g.length<=box.gpu - h.thickness));
 }
 function fans(f){return f is map && f.keys().hasOnly(${JSON.stringify(['front','rear','top','bottom','left','right'].flatMap(side=>[1,2,3].map(n=>side+'-'+n)))}) && f.values().hasOnly(['in','out']);}
 function valid(d){return d.keys().hasOnly(['title','titleKey','description','build','fanLayout','lighting','region','authorId','authorName','createdAt','updatedAt','hidden']) && d.title is string && d.title.size()>=3 && d.title.size()<=80 && d.titleKey is string && d.titleKey.size()>=3 && d.titleKey.size()<=80 && d.description is string && d.description.size()<=800 && d.authorName is string && d.authorName.size()>=1 && d.authorName.size()<=40 && d.region in ['ru','by'] && knownBuild(d.build) && fits(d.build) && fans(d.fanLayout) && d.lighting is map && d.lighting.keys().hasOnly(['mode','color']) && d.lighting.mode in ['off','color','rainbow'] && d.lighting.color is string && d.lighting.color.matches('#[a-fA-F0-9]{6}') && d.hidden is bool;}
 function quota(){return getAfter(/databases/$(database)/documents/publishLimits/$(request.auth.uid)).data;}
 match /builds/{id} {
  allow get: if resource.data.hidden==false || (signed() && resource.data.authorId==request.auth.uid) || admin();
  allow list: if request.query.limit<=25 && (resource.data.hidden==false || (signed() && resource.data.authorId==request.auth.uid));
  allow create: if signed() && request.resource.data.authorId==request.auth.uid && valid(request.resource.data) && request.resource.data.hidden==false && request.resource.data.createdAt==request.time && request.resource.data.updatedAt==request.time && quota().lastBuildId==id && quota().lastPublish==request.time;
  allow update: if (signed() && resource.data.authorId==request.auth.uid && request.resource.data.authorId==resource.data.authorId && request.resource.data.authorName==resource.data.authorName && request.resource.data.createdAt==resource.data.createdAt && request.resource.data.hidden==resource.data.hidden && request.resource.data.updatedAt==request.time && valid(request.resource.data)) || (admin() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['hidden']) && request.resource.data.hidden is bool);
  allow delete: if signed() && resource.data.authorId==request.auth.uid;
 }
 function validQuota(d,uid){return d.keys().hasOnly(['count','lastBuildId','lastPublish']) && d.count is int && d.count<=50 && d.lastPublish==request.time && d.lastBuildId is string && getAfter(/databases/$(database)/documents/builds/$(d.lastBuildId)).data.authorId==uid && getAfter(/databases/$(database)/documents/builds/$(d.lastBuildId)).data.createdAt==request.time;}
 match /publishLimits/{uid} {
  allow get: if signed() && uid==request.auth.uid;
  allow create: if signed() && uid==request.auth.uid && request.resource.data.count==1 && validQuota(request.resource.data,uid);
  allow update: if signed() && uid==request.auth.uid && request.resource.data.count==resource.data.count + 1 && request.time>=resource.data.lastPublish+duration.value(10,'s') && validQuota(request.resource.data,uid);
 }
 match /reports/{id} {
  allow create: if signed() && request.resource.data.keys().hasOnly(['buildId','authorId','reason','createdAt']) && request.resource.data.authorId==request.auth.uid && request.resource.data.buildId is string && id==request.resource.data.buildId+'_'+request.auth.uid && request.resource.data.reason is string && request.resource.data.reason.size()>=5 && request.resource.data.reason.size()<=400 && request.resource.data.createdAt==request.time && get(/databases/$(database)/documents/builds/$(request.resource.data.buildId)).data.hidden==false;
  allow get: if admin();
  allow list: if admin() && request.query.limit<=100;
  allow delete: if admin();
 }
 }
}
`;
fs.writeFileSync(new URL('firestore.rules',import.meta.url),rules);
console.log('Generated Firestore validation for',Object.values(catalog).flat().length,'parts');
