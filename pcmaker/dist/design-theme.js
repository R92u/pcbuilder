// Apply the saved skin before the page paints; changing it never reloads the app.
(() => {
 const key='pcmaker-design',stylesheet=document.getElementById('design-stylesheet');
 const normalize=value=>value==='glass'?'glass':'standard';
 const saved=()=>{try{return normalize(localStorage.getItem(key));}catch{return 'standard';}};
 let current=saved();
 function apply(value){
  current=normalize(value);
  if(stylesheet)stylesheet.media=current==='glass'?'all':'not all';
  document.documentElement.dataset.design=current;
  const color=document.querySelector('meta[name="theme-color"]');
  if(color)color.content=current==='glass'?'#141619':'#101014';
  document.querySelectorAll('[data-design-select]').forEach(select=>{select.value=current;});
 }
 apply(current);
 document.addEventListener('DOMContentLoaded',()=>{
  apply(current);
  document.querySelectorAll('[data-design-select]').forEach(select=>select.addEventListener('change',()=>{
   apply(select.value);
   try{localStorage.setItem(key,current);}catch{}
  }));
 },{once:true});
 window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(saved());});
 window.addEventListener('pageshow',event=>{if(event.persisted)apply(saved());});
})();
