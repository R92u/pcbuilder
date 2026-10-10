import {aioPlacement} from './aio.js';
import {caseLayout} from './layout.js';
import {resolve} from './catalog.js';
import {fanMounts,sanitizeFanLayout} from './fan-layout.js';
import {CPU_CENTER,gpuLayout} from './layout.js';

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const speed=value=>clamp(Number.isFinite(Number(value))?Number(value)/100:.6);
function segmentDistance(point,a,b){
 const delta=b.map((v,i)=>v-a[i]),length2=delta.reduce((s,v)=>s+v*v,0);
 const t=clamp(delta.reduce((s,v,i)=>s+v*(point[i]-a[i]),0)/(length2||1));
 return Math.hypot(...point.map((v,i)=>v-a[i]-t*delta[i]));
}

// Educational proxy, not CFD: area/RPM, inlet-outlet separation, coverage of
// hot components and opposition to the fixed front-to-rear tower cooler.
// The dimensionless coefficients below are assumptions, not measured fan data.
export function coolingAnalysis(build,settings={}){
 const p=resolve(build),mounts=fanMounts(build),layout=sanitizeFanLayout(build,settings.fanLayout);
 const fans=layout.map(f=>{const mount=mounts.find(m=>m.id===f.slot);return {...f,...mount,weight:(mount.size/1.2)**2*speed(settings[f.direction==='in'?'front':'rear'])};});
 const a=aioPlacement(p,caseLayout(p.case||{},p.gpu,p.cooler));
 if(a)for(const position of a.fans)fans.push({wall:a.wall,position,direction:a.wall==='top'?'out':'in',weight:.7*speed(settings.cpuFan)});
 const intake=fans.filter(f=>f.direction==='in'&&f.weight>0),exhaust=fans.filter(f=>f.direction==='out'&&f.weight>0);
 const inlet=intake.reduce((s,f)=>s+f.weight,0),outlet=exhaust.reduce((s,f)=>s+f.weight,0),warnings=[];
 const warn=(code,text)=>warnings.push({code,text});
 if(!fans.length)warn('no-fans','В корпусе нет вентиляторов. Добавь приток и вытяжку воздуха.');
 else if(!inlet&&!outlet)warn('stopped','Корпусные вентиляторы остановлены. Повышай обороты для отвода тепла.');
 else {
  if(!inlet)warn('no-intake','Нет активного вдува. Свежий воздух поступает только через свободные отверстия.');
  if(!outlet)warn('no-exhaust','Нет активного выдува. Нагретый воздух задерживается в корпусе.');
  if(inlet&&outlet&&Math.min(inlet,outlet)/Math.max(inlet,outlet)<.22)warn('imbalance','Сильный перекос между вдувом и выдувом. Выровняй число вентиляторов или их обороты.');
 }
 const hot=[];
 if(p.cpu)hot.push([0,CPU_CENTER.y,CPU_CENTER.z]);
 if(p.gpu){const g=gpuLayout(p.gpu);hot.push([.2,g.bottom-.10,(g.rear+g.end)/2]);}
 let pairs=0,quality=0,bypass=0,coverage=0;
 for(const a of intake)for(const b of exhaust){
  const weight=a.weight*b.weight,span=Math.hypot(...a.position.map((v,i)=>v-b.position[i]));
  const short=a.wall===b.wall||span<1.8;
  const reach=hot.length?hot.reduce((s,c)=>s+clamp(1-segmentDistance(c,a.position,b.position)/3.0),0)/hot.length:1;
  pairs+=weight;bypass+=weight*(short?1:0);coverage+=weight*reach;
  quality+=weight*(short?.35:1)*(.65+.35*reach);
 }
 const pathFactor=pairs?quality/pairs:.7;
 if(pairs&&bypass/pairs>.45)warn('short-path','Вдув и выдув слишком близко или на одной стенке: часть воздуха сразу выходит наружу. Разнеси их по корпусу.');
 if(pairs&&coverage/pairs<.28)warn('poor-coverage','Основной путь воздуха проходит далеко от CPU и GPU. Перенеси часть вентиляторов ближе к комплектующим.');
 const opposing=intake.filter(f=>f.wall==='rear'&&f.position[1]>2.9).reduce((s,f)=>s+f.weight,0);
 const counterflow=p.cooler&&p.cooler.type!=='aio'&&inlet?opposing/inlet:0;
 if(counterflow>.25)warn('cooler-counterflow','Задний вентилятор на вдув направлен навстречу потоку башенного кулера. Разверни его на выдув.');
 if(p.cooler&&speed(settings.cpuFan)===0)warn('cpu-stopped','Вентилятор процессорного кулера остановлен. CPU будет нагреваться сильнее.');
 const balanced=.35*(inlet+outlet)+.65*2*Math.min(inlet,outlet);
 return {warnings,inlet,outlet,pathFactor,counterflow,effective:balanced*pathFactor*(1-.15*counterflow)};
}
