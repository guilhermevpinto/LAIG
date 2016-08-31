
 function MyScoreBoard(scene) {
 	CGFobject.call(this,scene);
 	this.scene = scene;
 	this.blueMarker = new MyMarker(scene, 'blueMarker');
 	this.redMarker = new MyMarker(scene, 'redMarker');
 	this.yellowMarker = new MyMarker(scene, 'yellowMarker');
 	this.greenMarker = new MyMarker(scene, 'greenMarker');


	this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
	this.textShader.setUniformsValues({'dims': [16, 16]});
};

MyScoreBoard.prototype = Object.create(CGFobject.prototype);
MyScoreBoard.prototype.constructor = MyScoreBoard;

MyScoreBoard.prototype.display = function(){
	
	this.scene.pushMatrix();

	this.yellowMarker.display();

	this.scene.translate(-2, 0, 0);
	this.greenMarker.display();

	this.scene.translate(-2, 0, 0);
	this.redMarker.display();

	this.scene.translate(-2, 0, 0);
	this.blueMarker.display();

	this.scene.popMatrix();
	
};
