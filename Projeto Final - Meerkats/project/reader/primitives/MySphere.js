/**
 * MySphere
 * @constructor
 */
 function MySphere(scene, args) 
 {
 	CGFobject.call(this,scene);

 	
	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
 	this.texCoords = [];

	
	this.radius=args[0];
	this.slices=args[1];
	this.stacks=args[2];
	this.initBuffers();
 };

 MySphere.prototype = Object.create(CGFobject.prototype);
 MySphere.prototype.constructor = MySphere;

 MySphere.prototype.initBuffers = function() 
 {

 	var stackRadStep = Math.PI / this.stacks;
 	var sliceRadStep = 2 * Math.PI / this.slices;

	for (var stack = 0; stack <= this.stacks; ++stack) 
	{
		for (var slice = 0; slice <= this.slices; ++slice) 
		{
			this.vertices.push(this.radius * Math.sin(stack * stackRadStep) * Math.cos(slice * sliceRadStep), this.radius * Math.sin(stack * stackRadStep) * Math.sin(slice * sliceRadStep), this.radius * Math.cos(stack * stackRadStep));
			this.normals.push(Math.sin(stack * stackRadStep) * Math.cos(slice * sliceRadStep), Math.sin(stack * stackRadStep) * Math.sin(slice * sliceRadStep), Math.cos(stack * stackRadStep));
			this.texCoords.push(slice/this.slices, 1-stack/this.stacks);
		}
	}

	for (var stack = 0; stack < this.stacks; ++stack) 
	{
		for (var slice = 0; slice < this.slices; ++slice) 
		{
			this.indices.push(stack * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice + 1);
			this.indices.push(stack * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice + 1, stack * (this.slices + 1) + slice + 1);
		}
	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();

};

MySphere.prototype.updateTextCoords = function(ampS,ampT){
	this.updateTexCoordsGLBuffers();
};