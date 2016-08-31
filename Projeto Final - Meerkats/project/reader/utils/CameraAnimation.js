
function CameraAnimation(scene) {
	this.scene = scene;
	this.Perspective = 'Player Perspective';
	this.startTime = 0;
	this.span = 0;
	this.startPosition = null;
	this.startTarget = null;
	this.vectorMovement = null;
	this.vectorTarget = null;
	this.orbitationAngle = 0;
	this.orbitationAxis = vec3.fromValues(0,0,0);
	this.animationType = 'null';
};


CameraAnimation.prototype.handler = function(){
	if(this.span != 0)
	{
		this.animateCamera();
		return;
	}

	var state = this.scene.stateMachine.currentState;
		switch(state)
		{
			case 'Main Menu to Gameplay':
				this.scene.stateMachine.currentState = 'Gameplay';
				break;
			case 'Gameplay to Main Menu':
				this.scene.stateMachine.currentState = 'Main Menu';
				this.scene.stateMachine.game = new Game(this.scene);
				break;
			case 'Main Menu to How To':
				this.scene.stateMachine.currentState = 'How To';
				break;
			case 'How To to Main Menu':
				this.scene.stateMachine.currentState = 'Main Menu';
				break;
			default: break;
		}
};


CameraAnimation.prototype.startCameraAnimation = function(time, finalPosition, finalTarget){
	this.startTime = this.scene.milliseconds;
	this.span = time;
	this.animationType = 'translate';

	var delta = new vec3.create();

	this.startPosition = vec3.fromValues(this.scene.camera.position[0], this.scene.camera.position[1], this.scene.camera.position[2]);
	vec3.sub(delta, finalPosition, this.startPosition);
	this.vectorPosition = delta;

	delta = new vec3.create();
	this.startTarget = vec3.fromValues(this.scene.camera.target[0], this.scene.camera.target[1], this.scene.camera.target[2]);
	vec3.sub(delta, finalTarget, this.startTarget);
	this.vectorTarget = delta;
};


CameraAnimation.prototype.startCameraOrbit = function(time, axis, angle){
	this.startTime = this.scene.milliseconds;
	this.span = time;
	this.animationType = 'orbit';
	this.startPosition = vec3.fromValues(this.scene.camera.position[0], this.scene.camera.position[1], this.scene.camera.position[2]);
	this.orbitationAngle = angle;
	this.orbitationAxis = axis;
};


CameraAnimation.prototype.animateCamera = function(){
	var ratio = (this.scene.milliseconds - this.startTime) / this.span;
	if(ratio > 1)
		ratio = 1;
	if(this.animationType == 'translate')
	{	
		var newPosition = vec3.fromValues(this.startPosition[0] + this.vectorPosition[0]*ratio , this.startPosition[1] + this.vectorPosition[1]*ratio , this.startPosition[2] + this.vectorPosition[2]*ratio );
		this.scene.camera.setPosition(newPosition);
		var newTarget = vec3.fromValues(this.startTarget[0] + this.vectorTarget[0]*ratio , this.startTarget[1] + this.vectorTarget[1]*ratio , this.startTarget[2] + this.vectorTarget[2]*ratio );
		this.scene.camera.setTarget(newTarget);
	}
	
	if(this.animationType == 'orbit')
	{
		var rotation = this.orbitationAngle*ratio;

		this.scene.camera.setPosition(this.startPosition);
		this.scene.camera.orbit(this.axis, this.orbitationAngle*ratio);
	}
	
	if(ratio == 1)
		this.span = 0;
};