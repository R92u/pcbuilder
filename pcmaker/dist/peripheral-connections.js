// Connection modes are data capabilities, not browser Bluetooth/USB access.
// Explicit overrides and their manufacturer sources are in research/peripheral-connections.json.
export const connectionLabels={usb:'USB-кабель',receiver:'USB-приёмник · 2,4 ГГц',bluetooth:'Bluetooth',hdmi:'HDMI',dp:'DisplayPort',vga:'VGA',dvi:'DVI',usbCVideo:'USB-C · видеосигнал'};
const tri=['usb','receiver','bluetooth'];
const overrides={
 'logitech-pro-2-lightspeed':['usb','receiver'],'logitech-pro-x-superlight-2-dex':['receiver'],'logitech-pro-x-superlight-2-se':['receiver'],
 'logitech-g502-lightspeed-wireless-gaming-mouse':['usb','receiver'],'logitech-g502-x-wireless-lightforce':['usb','receiver'],'logitech-g903-hero-wireless-gaming-mouse':['usb','receiver'],'logitech-pro-x2-superlight-wireless-mouse':['usb','receiver'],
 'razer-rz03-04360800-r3r1':tri,'razer-rz01-04130100-r3c1':['receiver','bluetooth'],
 'razer-rz01-04630200-r3a1':['usb','receiver'],'razer-rz01-04620100-r3g1':tri,'razer-rz01-03730100-r3a1':['receiver','bluetooth'],
 'logitech-g309-lightspeed-gaming-mouse':['receiver','bluetooth'],
 'logitech-g515-tkl-wireless-keyboard':tri,'logitech-g915-x-tkl-wireless':tri,'logitech-pro-x-60-wireless-keyboard':tri,'logitech-pro-x-tkl-wireless-keyboard':tri
};
export function connectorType(value=''){
 const s=String(value).toLowerCase();
 if(/usb.?c|type.?c/.test(s))return 'usbC';
 if(/usb/.test(s))return 'usbA';
 if(/hdmi/.test(s))return 'hdmi';if(/displayport|^dp$/.test(s))return 'dp';
 if(/dvi/.test(s))return 'dvi';if(/vga|d-sub/.test(s))return 'vga';return null;
}
export function connectionModes(p){
 if(!p)return [];
 if(Array.isArray(p.connectionModes))return [...new Set(p.connectionModes.filter(m=>['usb','receiver','bluetooth'].includes(m)))];
 if(p.category==='monitor'){
  const s=p.specs?.['Порты']||'';return ['hdmi','dp','vga','dvi'].filter(t=>({hdmi:/HDMI/i,dp:/DisplayPort|\bDP\b/i,vga:/VGA|D-Sub/i,dvi:/DVI/i})[t].test(s));
 }
 if(overrides[p.id])return [...overrides[p.id]];
 const s=Object.entries(p.specs||{}).filter(([k])=>/подключ|интерфейс/i.test(k)).map(([,v])=>v).join(' '),m=[];
 if(p.wired===true||/(^|[ ,/])проводн|\bwired\b/i.test(s)||/^USB\s*\//i.test(s))m.push('usb');
 if(/радио|2[.,]4|LIGHTSPEED|HyperSpeed/i.test(s))m.push('receiver');
 if(/bluetooth/i.test(s))m.push('bluetooth');
 return m;
}
export function bluetoothSupport(board){
 if(!board)return false;
 if(board.id==='b650'||board.bluetooth===true)return true;
 if(board.ports?.some(p=>/bluetooth/i.test(p.label||'')))return true;
 if(board.wifi===false||board.id==='b550')return false;return null;
}
export function connectionError(product,mode,target,connections={},key=product?.category,pc={}){
 if(!connectionModes(product).includes(mode))return 'Этот способ не подтверждён для выбранной модели.';
 if(mode==='bluetooth')return bluetoothSupport(pc.motherboard)===true?'':bluetoothSupport(pc.motherboard)===false?'В сборке нет встроенного Bluetooth. Выбери USB-приёмник или другую плату.':'Поддержка Bluetooth этой платой пока не подтверждена.';
 if(!target)return 'Выбери разъём на ПК.';
 const expected=['usb','receiver'].includes(mode)?'usbA':mode;
 if(target.type!==expected)return 'Не подходит разъём: нужен '+(expected==='usbA'?'USB-A':connectionLabels[mode])+'.';
 if(product.category==='monitor'&&target.part==='motherboard'&&pc.cpu?.integratedGraphics!==true)return 'Видеовыход платы требует процессор со встроенной графикой.';
 if(Object.entries(connections).some(([k,v])=>k!==key&&v?.port===target.id))return 'Этот разъём уже занят другим устройством.';
 return '';
}
export const DESK_Y=7.5,ROUTE_Y=7.59;
export function safeWaypoints(value){return Array.isArray(value)?value.slice(0,8).filter(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)).map(([x,,z])=>[Math.max(-8.7,Math.min(8.7,x)),ROUTE_Y,Math.max(-3.7,Math.min(3.7,z))]):[];}
export function defaultWaypoints(start,end,key){if(key==='monitor')return [[start[0],ROUTE_Y,-3.45],[1,ROUTE_Y,-3.45],[end[0]+.30,ROUTE_Y,-3.45]];const x=key==='keyboard'?-4:key==='mouse'?2.8:start[0];return [[x,ROUTE_Y,Math.min(start[2]-.45,.4)],[x,ROUTE_Y,-3.45],[end[0]+.30,ROUTE_Y,-3.45]];}
// Segment/rectangle intersection prevents a moved waypoint from routing through
// the case even when both endpoints lie outside its footprint.
export function segmentHitsBox(a,b,box){
 let lo=0,hi=1;
 for(const [axis,min,max] of [[0,box.minX,box.maxX],[2,box.minZ,box.maxZ]]){
  const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue;}
  const t1=(min-a[axis])/delta,t2=(max-a[axis])/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;
 }return true;
}
export function routeError(points,box){
 if(points.some(p=>!p.every(Number.isFinite)||Math.abs(p[0])>8.85||Math.abs(p[2])>3.85))return 'Проведи кабель в пределах столешницы.';
 if(box&&[box].flat().some(b=>points.slice(1).some((p,i)=>segmentHitsBox(points[i],p,b))))return 'Путь пересекает устройство. Обведи кабель вокруг него.';
 return '';
}
export function sanitizeConnections(value,products,ports,pc){
 const out={};for(const key of ['monitor','keyboard','mouse']){
  const c=value?.[key],p=products[key];if(!c||!p||c.product!==p.id)continue;
  const target=ports.find(v=>v.id===c.port);
  if(c.mode==='bluetooth'?c.hardware!==pc.motherboard?.id:c.hardware!==pc[target?.part]?.id)continue;
  if(connectionError(p,c.mode,target,out,key,pc))continue;
  out[key]={product:p.id,mode:c.mode,port:c.mode==='bluetooth'?null:target.id,hardware:c.hardware,points:safeWaypoints(c.points)};
 }return out;
}
