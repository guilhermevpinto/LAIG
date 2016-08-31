function CircularAnimation(id, span, center, radius, startang, rotang) {
	this.id = id;
	this.span = span;
	this.center = center;
	this.radius = radius;
	this.startang = startang;
	this.rotang = rotang;

};

CircularAnimation.prototype = Object.create(Object.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.updateNodeMatrix = function(matrix, milliseconds){
	var newMatrix = mat4.create();
	var rotation;
	if(milliseconds <= this.span)
		rotation = milliseconds * this.rotang / this.span;
	else rotation = this.rotang;

	//calculates the position of the object
		//traslate circular trajectory for the apropriate center
	mat4.translate(newMatrix, newMatrix, this.center);
		//rotate de object around the center
	mat4.rotateY(newMatrix, newMatrix, rotation + this.startang);
		//translate the object for the radius to calculate the orbit operations
	mat4.translate(newMatrix, newMatrix, vec3.fromValues(this.radius, 0, 0));
		//calculates the direction that the object is facing
	if(rotation > 0)
		mat4.rotateY(newMatrix, newMatrix, -Math.PI); 

	return newMatrix;
};