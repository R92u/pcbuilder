export const backgroundDefaults=Object.freeze({preset:'dark',city:'day',blur:2,brightness:100});
export const backgroundPresets=['dark','light','room','city','custom'];
const bound=(value,min,max,fallback)=>typeof value==='number'&&Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
export function sanitizeBackground(value){
 return {preset:backgroundPresets.includes(value?.preset)?value.preset:'dark',city:value?.city==='night'?'night':'day',blur:bound(value?.blur,0,20,2),brightness:bound(value?.brightness,40,130,100)};
}
export function backgroundAsset(value){
 const s=sanitizeBackground(value);
 return s.preset==='room'?'./assets/backgrounds/room.jpg':s.preset==='city'?`./assets/backgrounds/city-${s.city}.jpg`:null;
}
export function imageSize(width,height,max=1920){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1||width*height>40000000)throw Error('Изображение слишком большое. Выбери файл до 40 мегапикселей.');
 const scale=Math.min(1,max/Math.max(width,height));return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
