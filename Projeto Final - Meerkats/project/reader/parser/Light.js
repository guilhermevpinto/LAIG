
function Light(scene,index,id,enable) {
    CGFlight.call(this, scene, index);
    this.enabled = enable;
    this._id = id;
}

Light.prototype = Object.create(CGFlight.prototype);
Light.prototype.constructor = Light;

