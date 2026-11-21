import * as THREE from 'three';

// Render only the inspected component into a small mask, including its instanced meshes.
export function createComponentOutline(){
 const layer=29;
 const mask=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false,samples:2});
 const solid=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
 const size=new THREE.Vector2();
 const uniforms={mask:{value:mask.texture},stepUV:{value:new THREE.Vector2()}};
 const edge=new THREE.ShaderMaterial({
  uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:'varying vec2 coord; void main(){coord=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D mask; uniform vec2 stepUV; varying vec2 coord;
   void main(){
    float center=texture2D(mask,coord).a;
    float around=0.;
    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
     around=max(around,texture2D(mask,coord+vec2(float(x),float(y))*stepUV).a);
    }
    gl_FragColor=vec4(.94,.95,.96,clamp(around-center,0.,1.)*.94);
   }`
 });
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),edge),screen=new THREE.Scene();
 screen.add(quad);
 const screenCamera=new THREE.Camera(),clearColor=new THREE.Color();
 let active=null;
 function select(object){
  if(active===object)return;
  active?.traverse(o=>{if(o.isMesh)o.layers.disable(layer);});
  active=object;
  active?.traverse(o=>{if(o.isMesh)o.layers.enable(layer);});
 }
 function render(renderer,scene,camera){
  if(!active?.visible)return;
  renderer.getDrawingBufferSize(size);
  const scale=Math.min(1,1600/Math.max(size.x,size.y));
  const width=Math.max(1,Math.round(size.x*scale)),height=Math.max(1,Math.round(size.y*scale));
  mask.setSize(width,height);
  uniforms.stepUV.value.set(1.6*renderer.getPixelRatio()/size.x,1.6*renderer.getPixelRatio()/size.y);
  const layers=camera.layers.mask,material=scene.overrideMaterial,background=scene.background;
  const target=renderer.getRenderTarget(),auto=renderer.autoClear,shadow=renderer.shadowMap.autoUpdate,alpha=renderer.getClearAlpha();
  renderer.getClearColor(clearColor);
  try {
   camera.layers.set(layer);scene.overrideMaterial=solid;scene.background=null;
   renderer.shadowMap.autoUpdate=false;renderer.autoClear=true;
   renderer.setRenderTarget(mask);renderer.setClearColor(0,0);renderer.render(scene,camera);
   renderer.setRenderTarget(target);renderer.autoClear=false;renderer.render(screen,screenCamera);
  } finally {
   renderer.setRenderTarget(target);renderer.setClearColor(clearColor,alpha);
   renderer.shadowMap.autoUpdate=shadow;renderer.autoClear=auto;
   camera.layers.mask=layers;scene.overrideMaterial=material;scene.background=background;
  }
 }
 return {select,render,dispose(){select(null);mask.dispose();solid.dispose();edge.dispose();quad.geometry.dispose();}};
}
