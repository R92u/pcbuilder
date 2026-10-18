const animations=new WeakMap();
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function cancel(element){animations.get(element)?.cancel();animations.delete(element);}
export function revealPanel(element,side=false){
 cancel(element);element.hidden=false;element.inert=false;
 if(reduced()||!element.animate)return;
 const animation=element.animate([{opacity:0,transform:side?'translateX(-14px)':'translateY(-8px) scale(.98)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
 animations.set(element,animation);animation.onfinish=()=>{if(animations.get(element)===animation)animations.delete(element);};
}
export function hidePanel(element){
 cancel(element);if(element.hidden)return;element.inert=true;
 if(reduced()||!element.animate){element.hidden=true;return;}
 const animation=element.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-5px) scale(.99)'}],{duration:140,easing:'ease-in',fill:'forwards'});
 animations.set(element,animation);animation.onfinish=()=>{if(animations.get(element)!==animation)return;element.hidden=true;cancel(element);};
}
// A short release response also works for keyboard activation and quick clicks.
document.addEventListener('click',event=>{
 const button=event.target.closest('.workshop-toolbar .round-button,.market-header .button');
 if(!button||button.disabled||reduced()||!button.animate)return;
 button.animate([{transform:'scale(.91)'},{transform:'scale(1.035)',offset:.65},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
},true);
