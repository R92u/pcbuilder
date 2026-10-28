import {verificationFor} from './verification.js';
import {priceQuality} from './price-quality.js';
import {specLabels} from './inspector.js';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function verificationMarkup(part,details=true){
 const v=verificationFor(part);
 if(v.status!=='verified')return `<p class="quality-badge ${v.status}">${e(v.label)}</p>`;
 const badge=`<span class="quality-badge verified">✓ ${e(v.label)}</span>`;
 if(!details)return badge;
 return `<details class="quality-details"><summary>${badge}</summary><p>Сверено ${e(v.checkedAt)}. Проверены: ${e(Object.keys(v.values).map(k=>specLabels[k]||k).join(', '))}.</p>${[...v.assumptions,...v.limitations].map(t=>`<p>${e(t)}</p>`).join('')}<p>Проверка характеристик не заменяет проверку BIOS, монтажных зазоров и наличия товара.</p><div>${v.sources.map((url,i)=>`<a href="${e(url)}" target="_blank" rel="noopener noreferrer">Источник ${i+1} ↗</a>`).join(' · ')}</div></details>`;
}
export function offerMarkup(offer){
 if(!offer)return '';
 const quality=priceQuality(offer);
 return `<span class="price-quality ${quality.status}">${e(quality.label)}</span><span class="price-availability">${offer.availability==='in-stock'?'В наличии на дату проверки':offer.availability==='out-of-stock'?'Предложение недоступно':'Наличие уточни у магазина'}</span>`;
}
