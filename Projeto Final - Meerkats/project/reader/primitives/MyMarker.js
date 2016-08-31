
 function MyMarker(scene, material) {
 	CGFobject.call(this,scene);
 	this.scene = scene;
 	this.quad = new MyQuad(this.scene);
 	this.pannel = new MyPannel(this.scene);
 	this.fontTexture = this.scene.graph.textures['numbers'];
 	this.material = material;

 	this.first = 0;
 	this.second = 0;


	this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
	this.textShader.setUniformsValues({'dims': [10, 1]});
};

MyMarker.prototype = Object.create(CGFobject.prototype);
MyMarker.prototype.constructor = MyMarker;

MyMarker.prototype.display = function(){
	
	this.scene.pushMatrix();
	this.scene.graph.materials[this.material].setTexture(this.scene.graph.textures['numbers']);
	this.scene.graph.materials[this.material].apply();

	//front
	this.scene.pushMatrix();
	this.scene.translate(0, 0, 0.499);
	this.scene.scale(2, 1, 1);
	this.quad.display();
	this.scene.popMatrix();

	//front
	this.scene.setActiveShaderSimple(this.textShader);
	this.scene.pushMatrix();
	this.scene.translate(-0.5, 0, 0.5);
	this.scene.activeShader.setUniformsValues({'charCoords': [this.first,0]});
	this.pannel.display();
	this.scene.popMatrix();

	this.scene.pushMatrix();
	this.scene.translate(0.5, 0, 0.5);
	this.scene.activeShader.setUniformsValues({'charCoords': [this.second,0]});
	this.pannel.display();
	this.scene.popMatrix();
	this.scene.setActiveShaderSimple(this.scene.defaultShader);


	//top
	this.scene.pushMatrix();
	this.scene.rotate(Math.PI/2, 1, 0, 0);
	this.scene.translate(0, 0, 0.5);
	this.scene.scale(2, 1, 1);
	this.quad.display();
	this.scene.popMatrix();

	//bot
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	this.scene.translate(0, 0, 0.5);
	this.scene.scale(2, 1, 1);
	this.quad.display();
	this.scene.popMatrix();

	//right
	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 0, 1, 0);
	this.scene.translate(0, 0, 1);
	this.quad.display();
	this.scene.popMatrix();


	this.scene.popMatrix();
};

