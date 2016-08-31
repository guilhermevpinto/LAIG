
function ControlPoint(point3D, orientation) {
	this.point3D = point3D;
	this.orientation = orientation;
	this.check = false;
	this.distance = 0;
	this.rotationAxis = vec3.create();
};
