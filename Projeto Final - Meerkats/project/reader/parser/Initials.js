function Initials() {

    this.frustum = {near: null,
                    far: null};
    this.transMatrix = mat4.create();
    
    this.refLength = 0;
};

Initials.prototype = Object.create(Object.prototype);
Initials.prototype.constructor = Initials;

Initials.prototype.rotateMatrix = function(axis,angle){
	switch(axis) {
		case 'x':
		mat4.rotate(this.transMatrix, this.transMatrix, angle*Math.PI/180, [1,0,0]);
		break;
		case 'y':
		mat4.rotate(this.transMatrix, this.transMatrix, angle*Math.PI/180, [0,1,0]);
		break;
		case 'z':
		mat4.rotate(this.transMatrix, this.transMatrix, angle*Math.PI/180, [0,0,1]);
		break;
		default:

	}
	
};

Initials.prototype.translateMatrix = function(translationVec){
	mat4.translate(this.transMatrix, this.transMatrix,translationVec);
};

Initials.prototype.scaleMatrix = function(scaleVec){
	mat4.scale(this.transMatrix, this.transMatrix, scaleVec);
};

Initials.prototype.setFrustum = function(near,far){
	this.frustum.near = near;
	this.frustum.far = far;
};

Initials.prototype.setReferenceLength = function(refLength){
	this.refLength = refLength;
};
