// Exact catalog variants: VENTUS, PULSE, ordinary Pop Air and H7 Flow do not
// inherit lighting from their RGB/GAMING variants. CC560 V2 has fixed LED fans.
export const lightingSources={
 rtx3090:'https://www.zotac.com/us/product/graphics_card/zotac-gaming-geforce-rtx-3090-trinity',
 cc560:'https://www.deepcool.com/products/Cases/fulltowercases/CC560-V2-Mid-Tower-Airflow-Case/2023/17782.shtml',
 'ch560-white':'https://pl.deepcool.com/products/Cases/CH560-WH-New-Generation-of-Airflow-Case/2023/17124.shtml'
};
export function caseLighting(part){
 if(part?.concept)return {type:'rgb',zones:'ring'};
 if(part?.id==='ch560-white')return {type:'rgb',zones:'blades'};
 if(part?.id==='cc560')return {type:'fixed',color:'#39c4c4',zones:'blades'};
 return null;
}
export function gpuLighting(part){return part?.id==='rtx3090'?{type:'rgb',zones:['side-logo','backplate-logo']}:null;}
export function sanitizeLighting(value){return {mode:['color','rainbow','off'].includes(value?.mode)?value.mode:'color',color:/^#[0-9a-f]{6}$/i.test(value?.color)?value.color:'#bba1ff'};}
