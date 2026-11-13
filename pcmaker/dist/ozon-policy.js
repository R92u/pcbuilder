import {dateStamp} from './price-quality.js';

export function ozonProductURL(link){
 try{
  if(typeof link!=='string'||/[\u0000-\u0020\u007f]/.test(link))return null;
  const u=new URL(link);
  if(u.protocol!=='https:'||!['ozon.ru','www.ozon.ru'].includes(u.hostname)
   ||u.username||u.password||u.port||/^https:\/\/[^/]+:\d+(?:\/|$)/i.test(link)
   ||u.search||u.hash||!/^\/product\/(?:[a-z0-9]+(?:-[a-z0-9]+)*-)?[1-9]\d*\/?$/.test(u.pathname))return null;
  return u.href;
 }catch{return null;}
}
export function isOzonOffer(offer){
 if(/^ozon$/i.test(offer?.store||''))return true;
 try{return ['ozon.ru','www.ozon.ru'].includes(new URL(offer?.url).hostname);}catch{return false;}
}
function validSellerProof(link){
 try{
  if(typeof link!=='string'||/[\u0000-\u0020\u007f]/.test(link))return false;
  const u=new URL(link);
  if(u.protocol!=='https:'||u.username||u.password||u.port||/^https:\/\/[^/]+:\d+(?:\/|$)/i.test(link)||u.search||u.hash)return false;
  // A proof URL records a manual review of the seller's relationship to the brand.
  // A marketplace badge or an arbitrary seller name is not verification by itself.
  return ['ozon.ru','www.ozon.ru'].includes(u.hostname)?/^\/seller\/[^/]+\/?$/.test(u.pathname):/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}$/i.test(u.hostname);
 }catch{return false;}
}
export function isApprovedOzonOffer(offer){
 if(!offer||!ozonProductURL(offer.url)||offer.currency!=='RUB'
  ||!Number.isFinite(offer.price)||offer.price<=0||offer.condition!=='new'||offer.priceType!=='regular')return false;
 const checked=dateStamp(offer.sellerVerifiedAt),quoted=dateStamp(offer.date);
 if(checked===null||quoted===null||checked>quoted)return false;
 if(offer.sellerType==='ozon')return ['Ozon Россия','Ozon Express'].includes(offer.seller);
 return offer.sellerType==='official-brand'&&typeof offer.seller==='string'&&offer.seller.trim().length>0&&validSellerProof(offer.sellerProofUrl);
}
