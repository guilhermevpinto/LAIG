/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, args) {
	CGFobject.call(this,scene);

	this.height=args[0];
	this.bottomRadius=args[1];
	this.topRadius=args[2];
	this.stacks=args[3];
	this.slices=args[4];

	this.indices = [];
	this.vertices = [];
	this.normals = []; 
	this.texCoords = [];

	this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

	var stepS = 0;
	var stepT = 0;
	var stepRadius = (this.topRadius - this.bottomRadius)/(this.stacks);
	var angle = 2 * Math.PI / (this.slices);

	this.vertices.push(0, 0, this.height);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);	
	
	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, -1);
	this.texCoords.push(0.5, 0.5);

	var i = 0;

	//bottom and top vertices
	for (var slice = 0; slice < this.slices; slice++)
	{
		this.vertices.push(this.topRadius * Math.cos(slice * angle), this.topRadius * Math.sin(slice * angle), this.height);
		this.vertices.push(this.bottomRadius * Math.cos(slice * angle), this.bottomRadius * Math.sin(slice * angle), 0);

		this.normals.push(0, 0, 1);
		this.normals.push(0, 0, -1);
		
		this.texCoords.push(Math.cos(i * angle) * 0.5 + 0.5, Math.sin(i * angle) * 0.5 + 0.5);
		this.texCoords.push(Math.cos(i * angle) * 0.5 + 0.5, Math.sin(i * angle) * 0.5 + 0.5);

		i++;

	}
	//bottom and top indices
	for (var slice = 0; slice < this.slices; slice++)
	{
		if (slice + 1 == this.slices)
		{
			this.indices.push(0, slice*2 + 2, 2);
			this.indices.push(slice*2 + 3, 1, 3);
		}	
		else 
		{
			this.indices.push(0, 2 + slice*2, 4 + slice*2);
			this.indices.push(3 + slice*2, 1, 5 + slice*2);
		}
	}
	
	var numVertex = this.slices*2 + 2;
	var currentRadius = this.bottomRadius;

	//lateral surface
	for (var stack = 0; stack <= this.stacks; stack++)
	{
		for (var slice = 0; slice <= this.slices; slice++)
		{
			this.vertices.push(currentRadius*Math.cos(slice * angle), currentRadius*Math.sin(slice * angle),this.height*stack/this.stacks);
			this.normals.push(Math.cos(slice * angle), Math.sin(slice * angle),0);
			this.texCoords.push(stepS, stepT);

			stepS += 1/this.slices;
		}
		stepS = 0;
		stepT+= 1/this.stacks;
		currentRadius += stepRadius;
	}


	for (var stack = 0; stack < this.stacks; stack++)
	{
		for (var slice = 0; slice < this.slices; slice++)
		{
			this.indices.push(stack * (this.slices+1) + slice + numVertex, stack * (this.slices+1) + slice + 1 + numVertex, (stack + 1) * (this.slices+1) + slice + 1 + numVertex);
			this.indices.push(stack * (this.slices+1) + slice + numVertex, (stack + 1) * (this.slices+1) + slice + 1 + numVertex, (stack + 1) * (this.slices+1) + slice + numVertex);
		}
	}

	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

MyCylinder.prototype.updateTextCoords = function(ampS,ampT){
	this.updateTexCoordsGLBuffers();
};