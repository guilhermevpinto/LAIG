
function MyBlock(scene, width, height, depth, material) {
	CGFobject.call(this,scene);
	this.scene = scene;
	this.height = height;
	this.width = width;
	this.depth = depth;
	this.material = material;
	this.texture = null;
	this.quad = new MyRectangle(this.scene, [-0.5, 0.5, 0.5, -0.5]);
};

MyBlock.prototype = Object.create(CGFobject.prototype);
MyBlock.prototype.constructor = MyBlock;



MyBlock.prototype.display =function(){
	this.scene.pushMatrix();
	this.scene.graph.materials[this.material].apply();
	//front
	this.scene.pushMatrix();
	if(this.texture != null)
		this.scene.graph.textures[this.texture].bind();
	this.scene.translate(0, 0, this.depth/2);
	this.scene.scale(this.width, this.height, 1);
	this.quad.display();
	if(this.texture != null)
		this.scene.graph.textures[this.texture].unbind();
	this.scene.popMatrix();

	//back
	this.scene.pushMatrix();
	this.scene.rotate(Math.PI, 1, 0, 0);
	this.scene.translate(0, 0, this.depth/2);
	this.scene.scale(this.width, this.height, 1);
	this.quad.display();
	this.scene.popMatrix();

	//top
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	this.scene.translate(0, 0, this.height/2);
	this.scene.scale(this.width, this.depth, 1);
	this.quad.display();
	this.scene.popMatrix();

	//bottom
	this.scene.pushMatrix();
	this.scene.rotate(Math.PI/2, 1, 0, 0);
	this.scene.translate(0, 0, this.height/2);
	this.scene.scale(this.width, this.depth, 1);
	this.quad.display();
	this.scene.popMatrix();

	//right
	this.scene.pushMatrix();
	this.scene.rotate(Math.PI/2, 0, 1, 0);
	this.scene.translate(0, 0, this.width/2);
	this.scene.scale(this.depth, this.height, 1);
	this.quad.display();
	this.scene.popMatrix();

	//left
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 0, 1, 0);
	this.scene.translate(0, 0, this.width/2);
	this.scene.scale(this.depth, this.height, 1);
	this.quad.display();
	this.scene.popMatrix();

	this.scene.popMatrix();
};

	