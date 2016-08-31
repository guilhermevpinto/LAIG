function PlayMenu(scene) {
	this.scene = scene;
	this.playerNumber = 0;
	this.block1 = new MyBlock(this.scene, 6, 4, 1, 'lightBlue');
	this.howtoButton = new MyBlock(this.scene, 4, 2, 0.3, 'orange');
	this.block2 = new MyBlock(this.scene, 6, 4, 1, 'red');
	this.playButton = new MyBlock(this.scene, 4, 2, 0.3, 'orange');
};


PlayMenu.prototype = Object.create(Object.prototype);
PlayMenu.prototype.constructor = PlayMenu;


PlayMenu.prototype.display = function(){
	if(this.playButton.texture == null)
	{
		this.playButton.texture = 'play';
		this.howtoButton.texture = 'howto';
	}

	this.scene.pushMatrix();
	this.scene.applyViewMatrix();


		this.scene.pushMatrix();
		this.scene.translate(-5,50,0);
		this.scene.rotate(Math.PI/9, 1, 0, 0);
		this.scene.rotate(Math.PI/4, 0, 1, 0);
		this.block1.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
		this.scene.translate(5,50,0);
		this.scene.rotate(Math.PI/9, 1, 0, 0);
		this.scene.rotate(-Math.PI/4, 0, 1, 0);
		this.block2.display();
		this.scene.popMatrix();


		this.scene.pushMatrix();
		this.scene.translate(-5+0.2,49.9,0.5);
		this.scene.rotate(Math.PI/9, 1, 0, 0);
		this.scene.rotate(Math.PI/4, 0, 1, 0);
		this.scene.register(this.howtoButton);
		this.howtoButton.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
		this.scene.translate(5-0.2,49.9,0.5);
		this.scene.rotate(Math.PI/9, 1, 0, 0);
		this.scene.rotate(-Math.PI/4, 0, 1, 0);
		this.scene.register(this.playButton);
		this.playButton.display();
		this.scene.popMatrix();


	this.scene.popMatrix();
};

PlayMenu.prototype.picking = function(obj){
	var ID = obj[1];
	switch(ID){
		case 1:
			this.scene.cameraAnimation.startCameraAnimation(1500, vec3.fromValues(0, 85, 1), vec3.fromValues(-5,90,-5));
			this.scene.stateMachine.currentState = 'Main Menu to How To';
			break;
		case 2:
			var requestString = '[sortColors,["' + this.scene.Humans + '"],["' + this.scene.Bots +'"],_Result]';
			this.scene.socket.sendRequest(requestString, 'colors');
			this.scene.cameraAnimation.startCameraAnimation(1500, vec3.fromValues(0, 30, 33), vec3.fromValues(0,0,0));
			this.scene.stateMachine.currentState = 'Main Menu to Gameplay';
			break;
		default: break;
	}				

};
