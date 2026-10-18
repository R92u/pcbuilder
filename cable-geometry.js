import {CurvePath,LineCurve3,QuadraticBezierCurve3,Vector3,Plane,Raycaster} from './vendor/three.module.js';

// A camera-facing plane through the actual source keeps the plug under the
// pointer at any viewing angle, without jumping to a shared plane in the case.
export function beginCableDrag(camera,source,pointer){
 const plane=new Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()),source);
 const ray=new Raycaster();ray.setFromCamera(pointer,camera);
 const hit=ray.ray.intersectPlane(plane,new Vector3());
 return {plane,offset:hit?source.clone().sub(hit):new Vector3()};
}
export function cableDragPoint(camera,pointer,drag){
 const ray=new Raycaster();ray.setFromCamera(pointer,camera);
 return ray.ray.intersectPlane(drag.plane,new Vector3())?.add(drag.offset)||null;
}
export function cablePreviewPoints(cable,end,snapped=false){
 if(snapped)return cable.points.map(p=>new Vector3(...p));
 const source=new Vector3(...cable.points[0]);
 const exit=new Vector3(...cable.points[1]).sub(source).normalize();
 const reach=Math.min(.18,source.distanceTo(end)*.3);
 return [source,source.clone().addScaledVector(exit,reach),source.clone().lerp(end,.55),end.clone()];
}

// Corner fillets stay in the convex hull of their neighbouring waypoints.
// An interpolating spline can overshoot a flat cable channel through the panel.
export function cableCurve(points,radius=.075){
 const path=new CurvePath(),p=points.map(v=>Array.isArray(v)?new Vector3(...v):v.clone());
 let previous=p[0];
 for(let i=1;i<p.length-1;i++){
  const a=p[i-1],b=p[i],c=p[i+1],cut=Math.min(radius,a.distanceTo(b)*.4,b.distanceTo(c)*.4);
  const before=b.clone().lerp(a,cut/(b.distanceTo(a)||1)),after=b.clone().lerp(c,cut/(b.distanceTo(c)||1));
  if(previous.distanceTo(before)>1e-6)path.add(new LineCurve3(previous,before));
  if(before.distanceTo(after)>1e-6)path.add(new QuadraticBezierCurve3(before,b,after));
  previous=after;
 }
 if(previous.distanceTo(p.at(-1))>1e-6)path.add(new LineCurve3(previous,p.at(-1)));
 return path;
}
export function strandPoints(cable,index){
 const offset=(index-(cable.strands-1)/2)*cable.radius*2.15;
 return cable.points.map((p,n)=>{
  const source=n===0&&cable.from==='Блок питания',end=n===cable.points.length-1;
  const axis=source||cable.spreadAxis==='x'||(end&&cable.endSpreadAxis==='x')?0:1;
  const taper=source?.60:end&&cable.id==='gpu16'?.65:1;
  return p.map((v,k)=>v+(k===axis?offset*taper:0));
 });
}
