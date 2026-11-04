import * as THREE from 'three';
import {resolve} from './catalog.js';
import {peripheralById} from './peripherals.js';
import {cableCurve,beginCableDrag,cableDragPoint} from './cable-geometry.js';
import {connectionModes,connectionLabels,connectionError,sanitizeConnections,defaultWaypoints,routeError,ROUTE_Y} from './peripheral-connections.js';

const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={monitor:'Монитор',keyboard:'Клавиатура',mouse:'Мышь'},storage='pcmaker-peripheral-cables-v1';
function clear(g){for(const c of [...g.children]){c.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});c.removeFromParent();}}
function line(group,points,color=0x151b20,radius=.025){
 if(points.length<2)return;
 const geometry=new THREE.TubeGeometry(cableCurve(points,.12),Math.max(48,points.length*10),radius,6,false);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.65}));mesh.castShadow=true;group.add(mesh);return mesh;
}
export class PeripheralCables{
 constructor(scene){
  this.scene=scene;this.selected='monitor';this.connections={};this.modes={};this.hidden=false;this.edit=false;
  try{const value=JSON.parse(localStorage.getItem(storage));this.connections=value?.connections||{};this.modes=value?.modes||{};this.hidden=value?.hidden===true;}catch{}
  this.wires=new THREE.Group();this.preview=new THREE.Group();scene.scene.add(this.wires,this.preview);
  this.layer=document.createElement('div');this.layer.className='peripheral-sockets';scene.container.append(this.layer);
  this.panel=document.getElementById('peripheral-cable-panel');this.launch=document.getElementById('peripheral-cables-button');
  this.launch.onclick=()=>this.open(!this.opened);this.panel.addEventListener('click',ev=>this.action(ev));this.panel.addEventListener('change',ev=>this.change(ev));
  this.escape=ev=>{if(ev.key==='Escape'){if(this.drag)this.endDrag(null,true);else this.open(false);}};
  this.blur=()=>this.endDrag(null,true);window.addEventListener('keydown',this.escape);window.addEventListener('blur',this.blur);
 }
 save(){try{localStorage.setItem(storage,JSON.stringify({connections:this.connections,modes:this.modes,hidden:this.hidden}));}catch{this.message='Не удалось сохранить настройки в браузере.';}}
 open(value=true){this.opened=value;this.panel.hidden=!value;this.launch.setAttribute('aria-expanded',String(value));if(!value)this.edit=false;this.renderPanel();this.rebuildMarkers();}
 refresh(){
  if(!this.scene.currentBuild)return;
  this.endDrag(null,true);this.scene.scene.updateMatrixWorld(true);this.pc=resolve(this.scene.currentBuild||{});this.products={};this.groups={};this.ports=[];
  for(const group of this.scene.peripheralRoot.children){const p=peripheralById[group.userData.productId];if(p){this.products[p.category]=p;this.groups[p.category]=group;}}
  for(const part of ['motherboard','gpu']){let index=0;this.scene.parts[part]?.traverse(node=>{if(node.userData.externalPort){const type=node.userData.externalPort;this.ports.push({id:part+':'+index++,part,type,node,name:(part==='gpu'?'Видеокарта':'Плата')+' · '+({usbA:'USB-A',usbC:'USB-C'}[type]||connectionLabels[type])+' №'+index});}});}
  const before=Object.keys(this.connections).length;this.connections=sanitizeConnections(this.connections,this.products,this.ports,this.pc);
  if(Object.keys(this.connections).length<before)this.message='Подключения заменённых или несовместимых устройств сброшены.';
  for(const [key,p] of Object.entries(this.products)){const modes=connectionModes(p);if(!modes.includes(this.modes[key]))this.modes[key]=modes[0];}
  this.draw();this.save();this.renderPanel();this.rebuildMarkers();
 }
 source(key){const group=this.groups[key],p=this.products[key];if(!group||!p)return null;
  const local=group.userData.cableStarts?.[this.modes[key]]||group.userData.cableStart||[0,.10,-p.dimensions[1]/200];return group.localToWorld(new THREE.Vector3(...local));
 }
 target(port){return port.node.getWorldPosition(new THREE.Vector3());}
 entry(key,a){return [a[0],ROUTE_Y,key==='monitor'?-3.45:a[2]-.30];}
 obstacles(){const boxes=[this.footprint()];for(const [key,p] of Object.entries(this.products)){const g=this.groups[key],w=key==='monitor'?Math.min(p.dimensions[0]/100*.48,p.stand==='l'?2.45:3.15):p.dimensions[0]/100,d=p.dimensions[1]/100*(key==='monitor'?.94:1);boxes.push({minX:g.position.x-w/2-.04,maxX:g.position.x+w/2+.04,minZ:g.position.z-d/2-.04,maxZ:g.position.z+d/2+.04});}return boxes;}
 footprint(){const b=new THREE.Box3().setFromObject(this.scene.caseGroup);return {minX:b.min.x-.06,maxX:b.max.x+.06,minZ:b.min.z-.06,maxZ:b.max.z+.06};}
 route(key,c){
  const a=this.source(key).toArray(),target=this.ports.find(p=>p.id===c.port);if(!target)return [];
  const b=this.target(target).toArray(),outside=b[0]+.38;
  let points=c.points?.length?c.points:defaultWaypoints(a,b,key);
  // Fixed source exit and final plug approach cannot be moved away from sockets.
  const entry=this.entry(key,a),exit=[outside,ROUTE_Y,b[2]];
  if(routeError([entry,...points,exit],this.obstacles()))points=defaultWaypoints(a,b,key);
  c.points=points;
  return [a,[a[0],a[1],a[2]-.15],entry,...points,exit,[outside,b[1],b[2]],b];
 }
 draw(){
  clear(this.wires);this.wires.visible=!this.hidden;
  for(const [key,c] of Object.entries(this.connections)){
   if(c.mode==='bluetooth')continue;
   const target=this.ports.find(p=>p.id===c.port);if(!target)continue;
   if(c.mode!=='receiver')line(this.wires,this.route(key,c),this.edit&&key===this.selected?0xb9c5cb:0x182025);
   const pos=this.target(target),plug=new THREE.Mesh(new THREE.BoxGeometry(c.mode==='receiver'?.18:.13,.075,.13),new THREE.MeshStandardMaterial({color:0x232d33,roughness:.6}));plug.position.copy(pos).add(new THREE.Vector3(.065,0,0));this.wires.add(plug);
  }
  this.groups?.monitor?.traverse(o=>{if(o.userData.monitorDisplay)o.material.color.set(this.connections.monitor?0xffffff:0x172127);});
 }
 connect(key,portId){
  const mode=this.modes[key],target=this.ports.find(p=>p.id===portId),error=connectionError(this.products[key],mode,target,this.connections,key,this.pc);
  if(error){this.say(error);return false;}
  this.connections[key]={product:this.products[key].id,mode,port:mode==='bluetooth'?null:target.id,hardware:mode==='bluetooth'?this.pc.motherboard.id:this.pc[target.part].id,points:[]};
  this.message=names[key]+': подключение установлено · '+connectionLabels[mode];this.draw();this.save();this.renderPanel();this.rebuildMarkers();return true;
 }
 say(text){this.message=text;const status=this.panel.querySelector('[role=status]');if(status)status.textContent=text;}
 renderPanel(){
  if(!this.products)return;const key=this.selected,p=this.products[key],modes=connectionModes(p),mode=this.modes[key],c=this.connections[key];
  const targets=this.ports.map(t=>({t,error:connectionError(p,mode,t,this.connections,key,this.pc)}));
  this.panel.innerHTML=`<div class="menu-heading"><h2 id="peripheral-cable-title">Подключения на столе</h2><button class="round-button" data-pcable="minimize" aria-label="Свернуть или развернуть настройки подключений">↕</button><button class="round-button" data-pcable="close" aria-label="Закрыть подключения">×</button></div><label>Устройство<select id="external-device" aria-label="Подключаемое устройство">${Object.entries(names).map(([k,n])=>`<option value="${k}" ${k===key?'selected':''}>${n} · ${e(this.products[k]?.name)}</option>`).join('')}</select></label><label>Способ подключения<select id="external-mode" aria-label="Способ подключения периферии">${modes.map(m=>`<option value="${m}" ${mode===m?'selected':''}>${connectionLabels[m]}</option>`).join('')}</select></label><p class="external-state">${c?'✓ Подключено · '+connectionLabels[c.mode]:'Не подключено'}${!modes.length?' · сведения уточняются':''}</p>${mode==='bluetooth'?'<p>Сопряжение в учебной сборке. Реальные устройства браузер не подключает.</p>':`<label>Разъём ПК<select id="external-target" aria-label="Разъём для периферии"><option value="">Выбери разъём</option>${targets.map(({t,error})=>`<option value="${t.id}" ${error?'disabled':''}>${e(t.name)}${error?' — '+e(error):''}</option>`).join('')}</select></label>`}<div class="external-actions"><button class="button primary" data-pcable="connect" ${!modes.length?'disabled':''}>${mode==='bluetooth'?'Сопрячь по Bluetooth':'Подключить'}</button><button class="button" data-pcable="disconnect" ${c?'':'disabled'}>Отключить</button><button class="button" data-pcable="view">Показать разъёмы ПК</button></div><div class="external-route"><button class="button" data-pcable="edit" aria-pressed="${this.edit}" ${!c||['receiver','bluetooth'].includes(c.mode)?'disabled':''}>${this.edit?'Закончить прокладку':'Изменить путь кабеля'}</button>${this.edit?'<p>Перетаскивай точки по столу. Стрелки двигают выбранную точку; Delete удаляет её. Esc отменяет перетаскивание.</p><div class="external-actions"><button class="button" data-pcable="add">Добавить точку</button><button class="button" data-pcable="reset">Сбросить путь</button></div>':''}</div><label class="external-hide"><input id="external-hidden" type="checkbox" ${this.hidden?'checked':''}> Скрыть кабели периферии</label><p role="status" aria-live="polite">${e(this.message||'Потяни точку на устройстве к подсвеченному разъёму. Можно также выбрать разъём из списка.')}</p><small>Проверяем тип сигнала и занятость порта. Частота и разрешение монитора, переходники и питание от розетки пока не моделируются. Расположение портов схематично; настройки сохраняются в этом браузере.</small>`;
  if(c?.port)this.panel.querySelector('#external-target')?.querySelector(`option[value="${c.port}"]`)?.setAttribute('selected','');
 }
 action(ev){const button=ev.target.closest('[data-pcable]');if(!button)return;const key=this.selected,c=this.connections[key];
  switch(button.dataset.pcable){
   case 'minimize':this.panel.classList.toggle('is-minimized');return;
   case 'close':this.open(false);return;
   case 'connect':this.connect(key,this.panel.querySelector('#external-target')?.value);return;
   case 'disconnect':delete this.connections[key];this.edit=false;this.message='Устройство отключено.';break;
   case 'view':this.scene.focus('connections');return;
   case 'edit':this.edit=!this.edit;this.hidden=false;if(this.edit)this.scene.focus('desk-cables');break;
   case 'reset':if(c)c.points=[];break;
   case 'add':if(c&&c.points.length<8){const a=c.points.at(-2)||c.points[0],b=c.points.at(-1);c.points.splice(c.points.length-1,0,a.map((v,i)=>(v+b[i])/2));}else this.message='Можно добавить до восьми точек.';break;
  }
  this.draw();this.save();this.renderPanel();this.rebuildMarkers();
 }
 change(ev){const id=ev.target.id;
  if(id==='external-device'){this.selected=ev.target.value;this.edit=false;}
  if(id==='external-mode'){this.modes[this.selected]=ev.target.value;delete this.connections[this.selected];this.edit=false;this.message='Способ изменён. Подключи устройство заново.';}
  if(id==='external-hidden'){this.hidden=ev.target.checked;if(this.hidden)this.edit=false;}
  if(id==='external-target')return;
  this.draw();this.save();this.renderPanel();this.rebuildMarkers();
 }
 marker(label,kind,position,handler){const b=document.createElement('button');b.className='external-socket '+kind;b.type='button';b.title=label;b.setAttribute('aria-label',label);b.textContent=kind==='external-point'?'•':kind==='external-source'?'○':'◇';this.layer.append(b);const item={button:b,kind,position};this.markers.push(item);handler?.(b,item);return item;}
 rebuildMarkers(){
  if(this.drag)return;this.layer.replaceChildren();this.markers=[];
  for(const key of Object.keys(this.products||{}))this.marker('Подключить: '+names[key],'external-source',()=>this.source(key),(b)=>{
   b.onclick=ev=>{this.selected=key;this.open(true);};
   this.bindDrag(b,()=>({kind:'plug',key}));
  });
  for(const port of this.ports||[])this.marker(port.name,'external-target',()=>this.target(port),(b,item)=>{item.port=port;b.onclick=()=>this.connect(this.selected,port.id);});
  const c=this.connections[this.selected];if(this.edit&&c)c.points.forEach((_,index)=>this.marker('Точка кабеля '+(index+1),'external-point',()=>new THREE.Vector3(...c.points[index]),b=>{
   this.bindDrag(b,()=>({kind:'point',key:this.selected,index}));b.onkeydown=ev=>{if(ev.key==='Delete'){if(c.points.length>1)c.points.splice(index,1);}else{const delta={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]}[ev.key];if(!delta)return;this.movePoint(index,c.points[index][0]+delta[0],c.points[index][2]+delta[1]);}ev.preventDefault();this.draw();this.save();this.rebuildMarkers();this.markers.filter(m=>m.kind==='external-point')[Math.min(index,c.points.length-1)]?.button.focus();};
  }));this.update();
 }
 bindDrag(b,spec){b.onpointerdown=ev=>{if(ev.button||this.scene.dragging||this.scene.fanEditing)return;const s=spec();if(s.kind==='plug'&&['bluetooth',undefined].includes(this.modes[s.key])){this.selected=s.key;this.open(true);return;}ev.preventDefault();ev.stopPropagation();this.selected=s.key;this.edit=s.kind==='point';this.opened=true;this.panel.hidden=false;this.launch.setAttribute('aria-expanded','true');this.renderPanel();const origin=s.kind==='point'?new THREE.Vector3(...this.connections[s.key].points[s.index]):this.source(s.key);this.drag={...s,id:ev.pointerId,button:b,start:[ev.clientX,ev.clientY],origin,old:this.connections[s.key]?.points.map(p=>[...p]),...beginCableDrag(this.scene.camera,origin,this.pointer(ev))};this.scene.controls.autoRotate=false;this.scene.controls.enabled=false;b.setPointerCapture(ev.pointerId);this.update();};b.onpointermove=ev=>this.moveDrag(ev);b.onpointerup=ev=>this.endDrag(ev);b.onpointercancel=()=>this.endDrag(null,true);b.onlostpointercapture=()=>{if(this.drag)this.endDrag(null,true);};}
 pointer(ev){const r=this.scene.container.getBoundingClientRect();return new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);}
 nearest(ev){let best=null,dist=22;for(const m of this.markers.filter(m=>m.port&&!m.button.hidden)){const r=m.button.getBoundingClientRect(),d=Math.hypot(ev.clientX-r.x-r.width/2,ev.clientY-r.y-r.height/2);if(d<dist){dist=d;best=m.port;}}return best;}
 movePoint(index,x,z){const c=this.connections[this.selected],points=c.points.map(p=>[...p]);points[index]=[x,ROUTE_Y,z];const a=this.source(this.selected),b=this.target(this.ports.find(p=>p.id===c.port));const err=routeError([this.entry(this.selected,a.toArray()),...points,[b.x+.38,ROUTE_Y,b.z]],this.obstacles());if(err){this.say(err);return false;}c.points=points;return true;}
 moveDrag(ev){const d=this.drag;if(!d||d.id!==ev.pointerId)return;ev.preventDefault();d.moved=Math.hypot(ev.clientX-d.start[0],ev.clientY-d.start[1])>4||d.moved;
  if(d.kind==='point'){const ray=new THREE.Raycaster();ray.setFromCamera(this.pointer(ev),this.scene.camera);const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-ROUTE_Y),new THREE.Vector3());if(hit&&this.movePoint(d.index,hit.x,hit.z)){this.draw();this.update();}return;}
  const port=this.nearest(ev),valid=port&&!connectionError(this.products[d.key],this.modes[d.key],port,this.connections,d.key,this.pc),end=valid?this.target(port):cableDragPoint(this.scene.camera,this.pointer(ev),d);clear(this.preview);if(end)line(this.preview,[d.origin.toArray(),d.origin.clone().lerp(end,.5).toArray(),end.toArray()],valid?0xbde3cf:0xcbd4d9,.032);d.target=valid?port.id:null;
 }
 endDrag(ev,cancel=false){const d=this.drag;if(!d)return;this.drag=null;this.scene.controls.enabled=true;clear(this.preview);if(d.button.hasPointerCapture(d.id))d.button.releasePointerCapture(d.id);
  if(d.kind==='point'){if(cancel)this.connections[d.key].points=d.old;else this.message='Путь кабеля сохранён.';this.draw();this.save();}
  else if(!cancel&&d.moved){const target=ev?this.nearest(ev):null;if(target)this.connect(d.key,target.id);else this.say('Подключение отменено: отпусти штекер над подходящим разъёмом.');}
  this.renderPanel();this.rebuildMarkers();
 }
 update(){if(!this.markers)return;const signature=Object.values(this.connections).filter(c=>c.port).map(c=>{const p=this.ports.find(t=>t.id===c.port);return p?this.target(p).toArray().map(v=>v.toFixed(4)).join(','):'';}).join(';');if(signature!==this.endpointSignature){this.endpointSignature=signature;this.draw();}const r=this.scene.container.getBoundingClientRect();for(const m of this.markers){const pos=m.position();if(!pos){m.button.hidden=true;continue;}const v=pos.clone().project(this.scene.camera);let visible=v.z>-1&&v.z<1&&Math.abs(v.x)<.98&&Math.abs(v.y)<.98&&!this.scene.fanEditing&&!this.scene.dragging;
   if(m.port){const err=connectionError(this.products[this.selected],this.modes[this.selected],m.port,this.connections,this.selected,this.pc);visible=visible&&(this.opened||!!this.drag)&&!this.edit;m.button.classList.toggle('compatible',!err);m.button.disabled=!!err;m.button.title=m.port.name+(err?' — '+err:'');}
   if(m.kind==='external-source')visible=visible&&!this.edit;
   m.button.hidden=!visible;m.button.style.left=(v.x*.5+.5)*r.width+'px';m.button.style.top=(-v.y*.5+.5)*r.height+'px';
  }}
 dispose(){this.endDrag(null,true);clear(this.wires);clear(this.preview);this.wires.removeFromParent();this.preview.removeFromParent();this.layer.remove();window.removeEventListener('keydown',this.escape);window.removeEventListener('blur',this.blur);}
}
