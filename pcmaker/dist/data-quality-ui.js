import {foreignPriceNotice} from './money.js';
import {verificationFor} from './verification.js';
import {priceQuality,offerStatusLine,formatPriceDate} from './price-quality.js';
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
 const check=offer.priceCheck,manual=check?.reason==='manual-review-required',failed=check&&check.status!=='updated'&&!manual;
 return `<span class="price-checked ${quality.status}" title="Цена и наличие зафиксированы в указанную дату; окончательные условия — в магазине">${e(offerStatusLine(offer))}</span>${quality.status!=='fresh'?`<span class="price-quality ${quality.status}">${e(quality.label)}</span>`:''}${manual?'<span class="price-refresh-note">Цена проверена вручную. Автоматическое обновление Ozon пока недоступно.</span>':''}${failed?`<span class="price-refresh-note">Повторная проверка ${e(formatPriceDate(check.attemptedAt.slice(0,10)))}: цену подтвердить не удалось. Сохранён предыдущий снимок.</span>`:''}${offer.currency==='USD'?`<span class="shop-offer-note">${foreignPriceNotice}</span>`:''}`;
}
