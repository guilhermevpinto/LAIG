function LinearAnimation(id, span, controlpoints) {
	this.id = id;
	this.span = span;
	this.controlpoints = [];
	this.totalDistance = 0;

	var originalOrientation = vec3.fromValues(0,0,1);
	var distances = [];
	for(var j = 0; j < controlpoints.length; j++){
		// stores the point coordinates
		var point = vec3.fromValues(controlpoints[j][0], controlpoints[j][1], controlpoints[j][2]);
		
		//condition for orientation calculations only applies for all CP's, except the last one (that gets the previous orientation)
		if(j < controlpoints.length - 1){
			//gets the next controlpoint coordinates to calculate orientation of the object
			var nextPoint = vec3.fromValues(controlpoints[j+1][0], controlpoints[j+1][1], controlpoints[j+1][2]);
			//gets the vector between the current controlpoint and the next one
			var vectorOrientation = vec3.create();
			vec3.sub(vectorOrientation, nextPoint, point);

			//stores the distance between two controlpoints.
			var distance = vec3.length(vectorOrientation);
			this.totalDistance += distance;
			distances.push(distance);

			// gets the normal vector of the orientation
			vec3.normalize(vectorOrientation, vectorOrientation);

			//the orientation of the objetc is always paralel to x0z
			vectorOrientation[1] = 0;

			// formula to calculate the angle between the orientation of the controlpoints and the original orientation (0,0,1)
			var orientation = Math.acos(vec3.dot(originalOrientation, vectorOrientation)/(vec3.length(vectorOrientation) * vec3.length(originalOrientation)));
			if(isNaN(orientation))
				orientation = 0;
			
			if(vectorOrientation[0] >= 0)
				this.controlpoints[j] = new ControlPoint(point, orientation);
			else this.controlpoints[j] = new ControlPoint(point, -orientation);
		}
		else this.controlpoints[j] = new ControlPoint(point, this.controlpoints[j-1].orientation);
		
	}

	var distance = 0;
	for(var j = 1; j < this.controlpoints.length; j++){
		//associates the distance for each correspondent controlpoint
		distance += distances[j - 1];
		this.controlpoints[j].distance = distance;
		
		
	}

};
 
LinearAnimation.prototype = Object.create(Object.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.updateNodeMatrix = function(matrix, milliseconds){
	var newMatrix = mat4.create();
	var currDistance = milliseconds * this.totalDistance / this.span;

	for(var j = 1; j < this.controlpoints.length; j++){

		// checks if a controlpoint was reached
		if(currDistance <= this.controlpoints[j].distance)
		{
			//setting the translation of the controlpoint
			if(currDistance == this.controlpoints[j].distance)
				mat4.translate(newMatrix, newMatrix, this.controlpoints[j].point3D);
			else 
				{
					mat4.translate(newMatrix, newMatrix, this.controlpoints[j-1].point3D);

					var distanceFraction = (currDistance - this.controlpoints[j-1].distance) / (this.controlpoints[j].distance - this.controlpoints[j-1].distance);
					var translation = vec3.create();
					var vector = vec3.create();
					vec3.sub(vector, this.controlpoints[j].point3D, this.controlpoints[j-1].point3D);
					vec3.scale(vector, vector, distanceFraction);
					mat4.translate(newMatrix, newMatrix, vector);
				}

			//setting the orientation of the object
			mat4.rotateY(newMatrix, newMatrix, this.controlpoints[j-1].orientation);

			break;
		}
		else if(j == this.controlpoints.length - 1)
		{
			mat4.translate(newMatrix, newMatrix, this.controlpoints[j].point3D);
			mat4.rotateY(newMatrix, newMatrix, this.controlpoints[j].orientation);
		}
	}

	mat4.multiply(newMatrix, matrix, newMatrix);
	return newMatrix;
};