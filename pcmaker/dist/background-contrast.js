const linear=value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4;

export function imageLuminance(pixels,brightness=100){
 let total=0,count=0;
 for(let i=0;i<pixels.length;i+=4){
  const alpha=pixels[i+3]/255;
  if(!alpha)continue;
  const channel=n=>linear(Math.min(1,pixels[i+n]/255*brightness/100));
  total+=(.2126*channel(0)+.7152*channel(1)+.0722*channel(2))*alpha;
  count+=alpha;
 }
 return count?total/count:0;
}

export function backgroundTone(pixels,brightness){
 return imageLuminance(pixels,brightness)>.28?'light':'dark';
}

export function createBackgroundContrast(root){
 let revision=0;
 const samples=new Map();
 function sample(url){
  if(!samples.has(url)){
   if(samples.size>=6)samples.delete(samples.keys().next().value);
   const pending=new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
     try{
      const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(image,0,0,32,32);resolve(ctx.getImageData(0,0,32,32).data);
     }catch(error){reject(error);}
    };
    image.onerror=()=>reject(Error('Background sampling failed'));
    image.src=url;
   });
   samples.set(url,pending);
   pending.catch(()=>{if(samples.get(url)===pending)samples.delete(url);});
  }
  return samples.get(url);
 }
 return async (state,url)=>{
  const current=++revision;
  let pixels;
  try{
   pixels=url?await sample(url):new Uint8ClampedArray(state.preset==='light'?[215,222,227,255]:[42,44,46,255]);
  }catch{pixels=new Uint8ClampedArray([42,44,46,255]);}
  if(current===revision)root.dataset.backgroundTone=backgroundTone(pixels,state.brightness);
 };
}
