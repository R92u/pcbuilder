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
export const DESK_Y=7.5, WIRE_RADIUS=.025, ROUTE_Y=DESK_Y+WIRE_RADIUS;
export const DESK_MAT={x:-1.6,z:1.5,w:8.5,d:3.5,height:.025};
export function deskMatLayout(product){
 if(product?.category!=='mat')return DESK_MAT;
 const [w,d,height]=product.dimensions.map(mm=>mm/100);
 return {x:w>=6?-1.6:1.8,z:w>=6?1.65:2,w,d,height};
}
export function surfaceHeight(x,z,mat=DESK_MAT){
 const mx=mat.w/2-Math.abs(x-mat.x),mz=mat.d/2-Math.abs(z-mat.z);
 return DESK_Y+mat.height*Math.max(0,Math.min(1,1+Math.min(mx,mz)/.08));
}
// Add contact points on both sides of the mat edge so long segments lie on
// the correct support even when both ends are outside the mouse mat.
export function supportedPoints(points,mat=DESK_MAT){
 const out=[];
 for(let i=0;i<points.length;i++){
  const [x,,z]=points[i];
  if(i){
   const [ax,,az]=points[i-1],times=[];
   for(const [start,end,center,span] of [[ax,x,mat.x,mat.w],[az,z,mat.z,mat.d]]){
    if(Math.abs(end-start)<1e-6)continue;
    for(const offset of [.08,0])for(const sign of [-1,1]){
     const t=(center+sign*(span/2+offset)-start)/(end-start);
     if(t>0&&t<1)times.push(t);
    }
   }
   for(const t of [...new Set(times)].sort((a,b)=>a-b)){
    const nx=ax+(x-ax)*t,nz=az+(z-az)*t;
    out.push([nx,surfaceHeight(nx,nz,mat)+WIRE_RADIUS,nz]);
   }
  }
  out.push([x,surfaceHeight(x,z,mat)+WIRE_RADIUS,z]);
 }
 return out;
}
export function safeWaypoints(value){return Array.isArray(value)?value.slice(0,8).filter(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)).map(([x,,z])=>[Math.max(-8.7,Math.min(8.7,x)),ROUTE_Y,Math.max(-3.7,Math.min(3.7,z))]):[];}
// Shortest visible route around expanded footprints. The extra corner margin
// leaves room for the cable radius and the rounded bends in the rendered tube.
export function defaultWaypoints(entry,exit,boxes){
 const nodes=[entry,exit];
 for(const b of boxes)for(const x of [b.minX-.14,b.maxX+.14])for(const z of [b.minZ-.14,b.maxZ+.14]){
  const point=[x,ROUTE_Y,z];
  if(!routeError([point],boxes)&&!boxes.some(box=>segmentHitsBox(point,point,box)))nodes.push(point);
 }
 const dist=nodes.map(()=>Infinity),parents=nodes.map(()=>-1),visited=new Set();
 dist[0]=0;
 while(visited.size<nodes.length){
  let best=-1;
  for(let n=0;n<nodes.length;n++)if(!visited.has(n)&&dist[n]<Infinity&&(best===-1||dist[n]<dist[best]))best=n;
  if(best===-1)return null;
  if(best===1)break;
  visited.add(best);
  for(let n=1;n<nodes.length;n++){
   if(visited.has(n)||routeError([nodes[best],nodes[n]],boxes))continue;
   const distance=dist[best]+Math.hypot(nodes[n][0]-nodes[best][0],nodes[n][2]-nodes[best][2]);
   if(distance<dist[n]){dist[n]=distance;parents[n]=best;}
  }
 }
 const path=[];
 for(let n=parents[1];n>0;n=parents[n])path.unshift(nodes[n]);
 if(!path.length)path.push([(entry[0]+exit[0])/2,ROUTE_Y,(entry[2]+exit[2])/2]);
 return path;
}
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
