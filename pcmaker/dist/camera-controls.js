import {OrbitControls} from './vendor/OrbitControls.js';

export class CameraControls extends OrbitControls {
  constructor(camera, canvas) {
    super(camera, canvas);
    this.enableDamping = true;
    this.rotateSpeed = 0.58;
    this.zoomSpeed = 0.65;
    this.zoomTarget = null;
  }

  // OrbitControls also calls update() on each input event. Accumulate the
  // input and advance the motion only when the scene supplies a frame time.
  update(seconds = 0, reducedMotion = false) {
    const distance = this.getDistance();
    if (this._scale !== 1) {
      if (distance > 0 && this._scale > 0 && Number.isFinite(this._scale)) {
        const pending = this.zoomTarget ?? distance;
        const reversing = (pending - distance) * (this._scale - 1) < 0;
        const next = (reversing ? distance : pending) * this._scale;
        this.zoomTarget = Math.max(this.minDistance, Math.min(this.maxDistance, next));
      }
      this._scale = 1;
    }

    // Cover 90% of the remaining gap in ~230 ms at any refresh rate.
    this.dampingFactor = reducedMotion && seconds > 0 ? 1 : -Math.expm1(-10 * seconds);
    if (seconds > 0 && this.zoomTarget != null && distance > 0) {
      const remaining = Math.log(this.zoomTarget / distance);
      if (reducedMotion || Math.abs(remaining) < 0.0003) {
        this._scale = this.zoomTarget / distance;
        this.zoomTarget = null;
      } else {
        this._scale = Math.exp(remaining * this.dampingFactor);
      }
    }
    return super.update(seconds);
  }

  stopMotion() {
    this.zoomTarget = null;
    this._sphericalDelta.set(0, 0, 0);
    this._panOffset.set(0, 0, 0);
  }
}
