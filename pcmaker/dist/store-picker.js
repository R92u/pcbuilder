import {storeLink,marketLink} from './regions.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dnsProductURL(link){
 try{
  if(typeof link!=='string'||/[\u0000-\u0020\u007f]/.test(link))return null;
  const u=new URL(link);
  if(u.protocol!=='https:'||!['dns-shop.ru','www.dns-shop.ru'].includes(u.hostname)
   ||u.username||u.password||u.port||/^https:\/\/[^/]+:\d+(?:\/|$)/i.test(link)||u.search||u.hash
   ||!/^\/product\/[a-f\d]{16}(?:\/[a-z\d][a-z\d-]*)?\/?$/i.test(u.pathname))return null;
  return u.href;
 }catch{return null;}
}
function linkMarkup({name,url,direct}){
 return `<a class="store-picker-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer"><span class="store-picker-name">${escape(name)}</span><span class="store-picker-note">${direct?'Карточка товара':'Поиск модели'} ↗</span></a>`;
}
export function storePickerMarkup(part,category,data={},source={}){
 const links=[];
 if(data.currency==='BYN'){
  const local=storeLink(part,category,data,source);
  const name=new URL(local.url).hostname.replace(/^www\./,'')==='5element.by'?'5 элемент':local.label.replace(/^(?:Товар|Найти) в /,'').replace(/ ↗$/,'');
  links.push({name,url:local.url,direct:local.label.startsWith('Товар')});
 }
 const ozon=storeLink(part,category,{...data,currency:'RUB'},source);
 links.push({name:'Ozon',url:ozon.url,direct:ozon.label.startsWith('Товар')});
 links.push({name:'Яндекс Маркет',url:marketLink(part),direct:false});
 const dns=[data.dnsLinks?.[part.id],source?.storeUrl,data.items?.[part.id]?.url].map(dnsProductURL).find(Boolean);
 links.push({name:'DNS',url:dns||'https://www.dns-shop.ru/search/?q='+encodeURIComponent(part.sku||part.name),direct:!!dns});
 return `<details class="store-picker"><summary class="button store-picker-toggle" aria-label="Найти в магазине: ${escape(part.name)}">Найти в магазине</summary><div class="store-picker-options">${links.map(linkMarkup).join('')}</div></details>`;
}

const mounted=new WeakMap();
export function mountStorePickers(root){
 if(!root)return ()=>{};
 if(mounted.has(root))return mounted.get(root);
 const doc=root.ownerDocument||root,keyboardTarget=doc.defaultView||doc;
 const opened=()=>[...root.querySelectorAll('details.store-picker[open]')];
 const close=(except=null)=>{for(const picker of opened())if(picker!==except)picker.open=false;};
 const onToggle=event=>{
  const picker=event.target;
  if(picker.matches?.('details.store-picker')&&picker.open)close(picker);
 };
 const onOutside=event=>{for(const picker of opened())if(!picker.contains(event.target))picker.open=false;};
 const onEscape=event=>{
  if(event.key!=='Escape')return;
  // A hidden/closed catalog must not intercept Escape in another dialog.
  const picker=opened().find(element=>element.getClientRects().length);
  if(!picker)return;
  event.preventDefault();event.stopPropagation();
  close();picker.querySelector('summary')?.focus();
 };
 root.addEventListener('toggle',onToggle,true);
 doc.addEventListener('pointerdown',onOutside,true);
 doc.addEventListener('click',onOutside,true);
 keyboardTarget.addEventListener('keydown',onEscape,true);
 const unmount=()=>{
  root.removeEventListener('toggle',onToggle,true);
  doc.removeEventListener('pointerdown',onOutside,true);
  doc.removeEventListener('click',onOutside,true);
  keyboardTarget.removeEventListener('keydown',onEscape,true);
  mounted.delete(root);
 };
 mounted.set(root,unmount);return unmount;
}
