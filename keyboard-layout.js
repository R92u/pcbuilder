// ANSI key positions in key units, then scaled into the manufacturer's case.
// Compact arrow clusters have their own bottom row; they are not a side column.
export function keyboardLayout(p){
 const full=p.keys>=100,tkl=p.format==='TKL',compact=['65%','75%'].includes(p.format),fn=full||tkl||p.format==='75%',shiva=p.id==='shiva';
 const letters=s=>[...s].map(l=>[l,1]);
 const rows=[
  [[fn?'`':'Esc',1],...letters('1234567890-='),['Back',2]],
  [['Tab',1.5],...letters('QWERTYUIOP[]'),['\\',1.5]],
  [['Caps',1.75],...letters("ASDFGHJKL;'"),['Enter',2.25]],
  [['Shift',2.25],...letters('ZXCVBNM,./'),['Shift',2.75]],
  [['Ctrl',1.25],['Win',1.25],['Alt',1.25],['Space',6.25],['Alt',1.25],['Fn',1.25],['Menu',1.25],['Ctrl',1.25]]
 ];
 if(compact){
  rows[0].push([p.format==='75%'?'Home':'Del',1]);rows[1].push(['End',1]);rows[2].push(['PgUp',1]);
  rows[3].at(-1)[1]=1.75;rows[3].push(['↑',1],['PgDn',1]);
  rows[4]=[['Ctrl',1.25],['Win',1.25],['Alt',1.25],['Space',6.25],['Alt',1],['Fn',1],['Ctrl',1],['←',1],['↓',1],['→',1]];
  if(p.format==='75%'){rows[4].splice(6,1);rows[4][4][1]=1.5;rows[4][5][1]=1.5;}
 }
 const units=[],start=fn?1.45:0,macro=shiva?1.15:0;
 const add=(legend,x,z,w=1,d=1,modifier=false,row=0)=>units.push({legend,x:x+macro,z,w,d,modifier,row});
 rows.forEach((row,r)=>{let x=0;row.forEach(([l,w],i)=>{add(l,x,start+r,w,1,r===4||i===0||w>1||['Del','End','PgUp','PgDn','Home'].includes(l),r);x+=w;});});
 if(fn){add('Esc',0,0);for(let i=0;i<12;i++)add('F'+(i+1),compact?1.2+i:2+i+Math.floor(i/4)*.25,0);if(compact)add('Del',13.45,0);}
 if(full||tkl){
  ['Prt','Scr','Pause'].forEach((l,i)=>add(l,15.5+i,0));
  ['Ins','Home','PgUp','Del','End','PgDn'].forEach((l,i)=>add(l,15.5+i%3,start+Math.floor(i/3)));
  [['↑',16.5,3],['←',15.5,4],['↓',16.5,4],['→',17.5,4]].forEach(([l,x,z])=>add(l,x,start+z));
 }
 if(full){
  [['Num',0,0],['/',1,0],['*',2,0],['−',3,0],['7',0,1],['8',1,1],['9',2,1],['+',3,1],['4',0,2],['5',1,2],['6',2,2],['1',0,3],['2',1,3],['3',2,3],['Ent',3,3],['0',0,4],['.',2,4]].forEach(([l,x,z])=>add(l,19+x,start+z,l==='0'?2:1,['+','Ent'].includes(l)?2:1));
 }
 if(shiva){
  for(let i=0;i<6;i++)units.push({legend:'G'+(i+1),x:0,z:1.1+i*.85,w:.8,d:.65,modifier:true,row:2});
  add('Rec',0,-.85,.85,.45,true);add('Play',4,-.85,1.2,.45,true);
 }else if(p.id==='whisper')for(let i=0;i<4;i++)add(['■','◀','▶','♪'][i],19+i,0,1,.85,true);
 const [w,d]=p.dimensions.map(n=>n/100),minZ=Math.min(...units.map(k=>k.z)),maxX=Math.max(...units.map(k=>k.x+k.w)),maxZ=Math.max(...units.map(k=>k.z+k.d));
 const padX=shiva?.13:.065,padZ=p.format==='75%'?.14:.055,depth=shiva?d*.66:d-padZ*2;
 return units.map(k=>({...k,x:-w/2+padX+(k.x+k.w/2)*(w-padX*2)/maxX,z:-d/2+padZ+(k.z-minZ+k.d/2)*depth/(maxZ-minZ),w:k.w*(w-padX*2)/maxX-.018,d:k.d*depth/(maxZ-minZ)-.018}));
}
