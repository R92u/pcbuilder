// A compact key layout in physical proportions, shared by the scene and checks.
export function keyboardLayout(p){
 const full=p.keys>=100,tkl=p.format==='TKL',functions=full||tkl||p.format==='75%',compact=p.format==='65%'||p.format==='75%',w=p.dimensions[0]/100,d=p.dimensions[1]/100;
 const rows=[
  [['Esc',1],...['1','2','3','4','5','6','7','8','9','0','−','='].map(x=>[x,1]),['←',2]],
  [['Tab',1.5],...['Q','W','E','R','T','Y','U','I','O','P','[',']'].map(x=>[x,1]),['\\',1.5]],
  [['Caps',1.75],...['A','S','D','F','G','H','J','K','L',';',"'"].map(x=>[x,1]),['Enter',2.25]],
  [['Shift',2.25],...['Z','X','C','V','B','N','M',',','.','/'].map(x=>[x,1]),['Shift',2.75]],
  [['Ctrl',1.25],['Win',1.25],['Alt',1.25],['',6.25],['Alt',1.25],['Fn',1.25],['Menu',1.25],['Ctrl',1.25]]
 ];
 if(functions)rows[0][0][0]='~';
 const units=[],start=functions?1.35:0,macro=p.id==='shiva'?1:0;
 const add=(legend,x,z,kw=1,kd=1,modifier=false)=>units.push({legend,x:x+macro,z,w:kw,d:kd,modifier});
 rows.forEach((row,i)=>{let x=0;row.forEach(([legend,kw],col)=>{add(legend,x,start+i,kw,1,i===4||col===0||col===row.length-1);x+=kw;});});
 if(functions){add('Esc',0,0);for(let i=0;i<12;i++)add('F'+(i+1),2+i,0);}
 if(full||tkl){
  ['Prt','Scr','Pause'].forEach((l,i)=>add(l,15.5+i,0));
  ['Ins','Home','PgUp','Del','End','PgDn'].forEach((l,i)=>add(l,15.5+i%3,start+Math.floor(i/3)));
  [['↑',16.5,3],['←',15.5,4],['↓',16.5,4],['→',17.5,4]].forEach(([l,x,z])=>add(l,x,start+z));
 }else if(compact){
  ['Del','PgUp','PgDn','↑','←','↓','→'].forEach((l,i)=>add(l,15.2,start+i*5/7,1,5/7));
 }
 if(full){
  [['Num',0,0],['/',1,0],['*',2,0],['−',3,0],['7',0,1],['8',1,1],['9',2,1],['+',3,1],['4',0,2],['5',1,2],['6',2,2],['1',0,3],['2',1,3],['3',2,3],['Ent',3,3],['0',0,4],['.',2,4]].forEach(([l,x,z])=>add(l,19+x,start+z,l==='0'?2:1,['+','Ent'].includes(l)?2:1));
 }
 const extra=p.keys-units.length;
 for(let i=0;i<extra;i++){
  if(p.id==='shiva')units.push({legend:'G'+(i+1),x:0,z:i*.75,w:.8,d:.65,modifier:true});
  else add(['Vol−','Vol+','Mute','Play'][i%4],19+i,0,1,.8,true);
 }
 const maxX=Math.max(...units.map(k=>k.x+k.w)),maxZ=Math.max(...units.map(k=>k.z+k.d)),pad=.06,availableD=p.id==='shiva'?d*.7:d-pad*2;
 return units.map(k=>({legend:k.legend,modifier:k.modifier,x:-w/2+pad+(k.x+k.w/2)*(w-pad*2)/maxX,z:-d/2+pad+(k.z+k.d/2)*availableD/maxZ,w:k.w*(w-pad*2)/maxX-.018,d:k.d*availableD/maxZ-.018}));
}
export function peripheralAppearance(p){
 const light=p.colors.includes('white')&&!p.colors.includes('black');
 return {body:light?'#dce2df':'#20262a',keys:light?'#e4e6e2':'#343d42',modifiers:light?'#b4b8b4':'#343d42',...p.appearance};
}
