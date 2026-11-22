import {BufferGeometry, Line, LineBasicMaterial, Vector3, Mesh, SphereGeometry, MeshBasicMaterial, MathUtils} from './vendor/three.module.js';

const duration = 1350;
const smooth = value => MathUtils.smoothstep(value, 0, 1);

export class CableFlight {
  constructor(scene, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.enabled = true;
  }

  start(points, now) {
    this.cancel();
    if (!this.enabled || points.length < 2) return;
    const route = points.map(p => p.isVector3 ? p.clone() : new Vector3(...p));
    if (route.some(p => !Number.isFinite(p.x + p.y + p.z))) return;
    const distances = [0];
    for (let i = 1; i < route.length; i++) distances.push(distances[i - 1] + route[i].distanceTo(route[i - 1]));
    const length = distances.at(-1);
    if (length < .001) return;

    const position = this.camera.position.clone();
    const target = this.controls.target.clone();
    const offset = position.clone().sub(target);
    // Stay on the viewer's side of the case or desk. Show hidden sections through the panel.
    offset.setLength(MathUtils.clamp(length * .65, 2.4, Math.max(2.4, offset.length() * .78)));
    const material = new LineBasicMaterial({color:0xc2ecff, transparent:true, opacity:0, depthTest:false, depthWrite:false});
    const line = new Line(new BufferGeometry().setFromPoints(route), material);
    const tip = new Mesh(new SphereGeometry(MathUtils.clamp(length * .009, .037, .085), 10, 8),
      new MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0, depthTest:false, depthWrite:false}));
    tip.position.copy(route[0]);
    line.add(tip);
    line.renderOrder = 80;
    tip.renderOrder = 81;
    this.scene.add(line);
    this.active = {route, distances, length, position, target, offset, rotation:this.camera.quaternion.clone(), line, tip, lastFrame:now, elapsed:0};
  }

  update(time) {
    const flight = this.active;
    if (!flight) return false;
    // A stall while the GPU uploads a new mesh must not consume the whole shot.
    flight.elapsed += MathUtils.clamp(time - flight.lastFrame, 0, 120);
    flight.lastFrame = Math.max(flight.lastFrame, time);
    const t = flight.elapsed / duration;
    if (t >= 1) { this.cancel(); return true; }
    const distance = flight.length * smooth((t - .13) / .52);
    let i = 1;
    while (i < flight.route.length - 1 && flight.distances[i] < distance) i++;
    const fraction = (distance - flight.distances[i - 1]) / (flight.distances[i] - flight.distances[i - 1] || 1);
    const point = flight.tip.position.lerpVectors(flight.route[i - 1], flight.route[i], fraction);
    const weight = smooth(t / .30) * (1 - smooth((t - .73) / .27));
    flight.line.material.opacity = .28 * weight;
    flight.tip.material.opacity = weight;
    this.controls.target.lerpVectors(flight.target, point, weight);
    this.camera.position.copy(point).add(flight.offset).lerp(flight.position, 1 - weight);
    this.camera.lookAt(this.controls.target);
    return true;
  }

  cancel() {
    const flight = this.active;
    if (!flight) return;
    this.camera.position.copy(flight.position);
    this.camera.quaternion.copy(flight.rotation);
    this.controls.target.copy(flight.target);
    flight.line.removeFromParent();
    for (const mesh of [flight.tip, flight.line]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.active = null;
  }
}
