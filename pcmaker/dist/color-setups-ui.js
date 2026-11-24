import {SETUP_PALETTES,pickColorSetup} from './color-setups.js';
import {productImages} from './product-images.js';
import {categories} from './catalog.js';

const labels={...Object.fromEntries(categories),chair:'Кресло',keyboard:'Клавиатура',mouse:'Мышь',monitor:'Монитор'};
const notes={accent:'Цвет в деталях',neutral:'Нейтральное сочетание',retained:'Текущий корпус'};
function element(tag,text){
 const node=document.createElement(tag);
 if(text)node.textContent=text;
 return node;
}

export function mountColorSetups({getBuild,getSelection,onApply}){
 const dialog=document.getElementById('color-setups-dialog');
 const swatches=document.getElementById('setup-swatches');
 const products=document.getElementById('setup-products');
 const internals=document.getElementById('setup-pc');
 const apply=document.getElementById('setup-apply');
 let plan=null;
 for(const [index,palette] of SETUP_PALETTES.entries()){
  const label=element('label'),input=element('input');
  input.type='radio';input.name='setup-palette';input.value=palette.id;input.checked=index===0;
  const caption=element('span'),dot=element('i');
  dot.style.setProperty('--swatch',palette.color);
  caption.append(dot,document.createTextNode(palette.label));label.append(input,caption);swatches.append(label);
 }
 function preview(){
  const id=swatches.querySelector('input:checked').value;
  plan=pickColorSetup(id,getBuild(),getSelection());
  apply.disabled=!plan;
  if(!plan){
   products.replaceChildren();
   internals.hidden=true;
   document.getElementById('setup-summary').textContent='В каталоге пока нет полного набора для этого цвета.';
   return;
  }
  products.replaceChildren(...plan.items.map(item=>{
   const card=element('li'),info=element('div');
   const src=item.category==='case'?productImages[item.id]?.image:'assets/peripherals/'+item.id+'.webp';
   if(src){const image=element('img');image.alt='';image.src='./'+src;card.append(image);}
   info.append(element('small',labels[item.category]),element('strong',item.name),element('small',item.color));
   if(notes[item.match])info.append(element('em',notes[item.match]));
   card.append(info);return card;
  }));
  internals.hidden=!plan.addedInternals.length;
  internals.querySelector('summary').textContent='Комплектующие внутри ПК · '+plan.addedInternals.length;
  internals.querySelector('ul').replaceChildren(...plan.addedInternals.map(p=>element('li',labels[p.category]+' — '+p.name)));
  document.getElementById('setup-summary').textContent=plan.addedInternals.length?'Будет собран компьютер с периферией.':'Установленные комплектующие ПК сохранятся.';
 }
 document.getElementById('color-setups-button').onclick=()=>{internals.open=false;preview();dialog.showModal();};
 const url=new URL(location.href);
 if(url.searchParams.get('setups')==='1'){
  url.searchParams.delete('setups');
  history.replaceState(null,'',url);
  document.getElementById('color-setups-button').click();
 }
 swatches.addEventListener('change',preview);
 apply.onclick=()=>{if(plan){onApply(plan);dialog.close();}};
}
