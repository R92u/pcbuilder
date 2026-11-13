import {allowedURL,hostOf} from './price-refresh-core.mjs';
import {priceQuality} from '../dist/price-quality.js';
import {isApprovedOzonOffer} from '../dist/ozon-policy.js';

const currencies={ru:'RUB',by:'BYN',usd:'USD'};
function candidateKey(url){const u=new URL(url);return hostOf(url)+u.pathname.replace(/\/$/,'')+u.search;}

// Historical quotes supply candidates only; amounts/dates need a fresh page check.
export function createRefreshPlan(products,entries,{region,host,limit=500,now=Date.now()}={}){
 const groups=new Map(),filterHost=host?.replace(/^www\./,'');
 for(const {region:entryRegion,id,offer} of entries){
  const product=products[id],currency=currencies[entryRegion];
  if(!product||!currency||region&&entryRegion!==region||!offer?.store||!allowedURL(offer.url))continue;
  if(offer.currency&&offer.currency!==currency||filterHost&&hostOf(offer.url)!==filterHost)continue;
  const key=entryRegion+':'+id;
  if(!groups.has(key))groups.set(key,{id,region:entryRegion,product,candidates:[],seen:new Map()});
  const group=groups.get(key),urlKey=candidateKey(offer.url);
  const metadata=Object.fromEntries(['price','date','store','url','note','kind','availability','verification','seller','sellerType','priceType','condition','sellerProofUrl','sellerVerifiedAt'].filter(k=>offer[k]!==undefined).map(k=>[k,offer[k]]));
  const candidate={region:entryRegion,id,product,offer:{...metadata,currency}};
  if(group.seen.has(urlKey)){
   const index=group.seen.get(urlKey);
   if(preferManualCandidate(candidate,group.candidates[index],now))group.candidates[index]=candidate;
   continue;
  }
  group.seen.set(urlKey,group.candidates.length);group.candidates.push(candidate);
 }
 return [...groups.values()].slice(0,limit).map(({seen,...group})=>group);
}

export function planSummary(plan){
 const sources={},regions={};let candidates=0;
 for(const item of plan){regions[item.region]=(regions[item.region]||0)+1;for(const target of item.candidates){const host=hostOf(target.offer.url);sources[host]=(sources[host]||0)+1;candidates++;}}
 return {products:plan.length,withBackup:plan.filter(p=>p.candidates.length>1).length,candidates,regions,sources};
}

const availabilityRank=offer=>offer?.availability==='in-stock'?3:offer?.availability==='unknown'?2:offer?.availability==='out-of-stock'?1:0;
export function retainManualOffer(target,now=Date.now()){
 return target.region==='ru'&&hostOf(target.offer.url)==='ozon.ru'&&target.offer.verification==='reviewed-source'&&target.offer.availability!=='out-of-stock'&&isApprovedOzonOffer(target.offer)&&priceQuality(target.offer,now).status==='fresh';
}
function preferManualCandidate(candidate,previous,now){
 if(!retainManualOffer(candidate,now))return false;
 if(!previous)return true;
 const next=candidate.offer,old=previous.offer;
 if(next.date<old.date)return false;
 return !retainManualOffer(previous,now)||next.date>old.date||availabilityRank(next)>availabilityRank(old)||availabilityRank(next)===availabilityRank(old)&&next.price<old.price;
}
export function updateHostCircuit(state,result){
 if(state.circuit)return;
 if(result.error&&(result.error==='http-429'||result.retryAfterUnusable||result.retryAfterMs>5000)){
  state.circuit='source-rate-limited';state.circuitCause=result.error;
 }else if(['http-401','http-403','access-blocked'].includes(result.error)){
  state.circuit='source-blocked';state.circuitCause=result.error;
 }else if(/^(?:network-error|timeout|http-5\d\d)$/.test(result.error||'')){
  if(++state.failures>=3){state.circuit='network-error';state.circuitCause=result.error;}
 }else state.failures=0;
}
const safeReason=value=>typeof value==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(value)?value:undefined;
export function attemptRecord(target,result){
 const reason=safeReason(result.error)||null;
 const record={url:target.offer.url,status:result.offer?'updated':/access|robots|source-rate-limited|source-blocked|http-40[13]|http-429/.test(reason)?'blocked':reason==='http-404'?'unavailable':/network|timeout|http-5/.test(reason)?'error':'unverified',reason};
 if(safeReason(result.cause))record.cause=result.cause;
 if(Number.isInteger(result.httpStatus)&&result.httpStatus>=100&&result.httpStatus<=599)record.httpStatus=result.httpStatus;
 const requests=result.requestAttempts??result.attempts;
 if(Number.isInteger(requests)&&requests>=0&&requests<=3)record.requestAttempts=requests;
 return record;
}

// No two workers fetch the same shop concurrently. The caller keeps host state
// (robots and circuit breakers) across rounds as alternatives are considered.
export async function runRefreshPlan(plan,{attempt,concurrency=3,now=Date.now()}){
 const states=plan.map(item=>{
  const manualTarget=item.candidates.reduce((chosen,candidate)=>preferManualCandidate(candidate,chosen,now)?candidate:chosen,null);
  return {...item,results:[],best:null,next:0,manualTarget,manualRetained:!!manualTarget};
 });
 while(true){
  const groups=new Map();
  for(const state of states){
   if(state.manualRetained||state.best?.result.offer.availability==='in-stock'||state.next>=state.candidates.length)continue;
   const index=state.next++,target=state.candidates[index],host=hostOf(target.offer.url);
   if(!groups.has(host))groups.set(host,[]);
   groups.get(host).push({state,index,target});
  }
  if(!groups.size)break;
  const queue=[...groups.values()];
  async function worker(){
   while(queue.length){
    const rows=queue.shift();
    for(const {state,index,target} of rows){
     const result=await attempt(target),entry={target,result,index};
     state.results.push(entry);
     if(result.offer&&(!state.best||availabilityRank(result.offer)>availabilityRank(state.best.result.offer)))state.best=entry;
    }
   }
  }
  await Promise.all(Array.from({length:Math.max(1,Math.min(3,concurrency))},worker));
 }
 return states.map(state=>{
  const chosen=state.manualRetained?{target:state.manualTarget,result:{error:'manual-review-required',retainedOffer:state.manualTarget.offer,requestAttempts:0}}:state.best||state.results[0];
  const records=state.manualRetained?[chosen]:state.results;
  return {id:state.id,region:state.region,target:chosen.target,result:chosen.result,manualRetained:state.manualRetained,fallbackUpdated:!!state.best&&chosen.index>0,attempts:records.map(({target,result})=>attemptRecord(target,result))};
 });
}
