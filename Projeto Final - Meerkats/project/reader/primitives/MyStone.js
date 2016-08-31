var INITIAL_STANDBY_SPEED = 0.25;
var MOVEMENT_SPEED = 0.30;

function MyStone(scene, id, colorMaterial, position) {
	CGFobject.call(this,scene);
	this.id = id;
	this.scene = scene;
	this.position = position;
	this.colorMaterial = colorMaterial;
	this.makeStone();
	this.settledTile = null;
	this.picked = false;
	this.moving = false;
	this.roundNumberAction = 0;

	this.standByAnimationHeight = 0;
	this.standByAnimationVelocity = 0;

	this.movementInitialPosition = null;
	this.movementFinalPosition = null;
	this.movementSteps = 0;
	this.movementIteration = 0;
};

MyStone.prototype = Object.create(CGFobject.prototype);
MyStone.prototype.constructor = MyStone;

//onde a peça está localizada, ou seja, o tile onde ela está pousada no formato [MyBoardTile,55] 55 por exemplo, que é o picking ID do tile do tabuleiro
MyStone.prototype.setSettledTile = function(tile){
	this.settledTile = tile;

}
MyStone.prototype.makeStone = function() {

	topControlPoints= 
	[
		[
			[0,0,0.9,1],[0.8,0,1,1],[0.8,0,2,1],[0,0,2.1,1]
		],
		[
			[0,0,0.9,1],[0.3,0.5,1,1],[0.3,0.5,2,1],[0,0,2.1,1]
		],
		[	
			[0,0,0.9,1],[-0.3,0.5,1,1],[-0.3,0.5,2,1],[0,0,2.1,1]
		],
		[	
			[0,0,0.9,1],[-0.8,0,1,1],[-0.8,0,2,1],[0,0,2.1,1]
		]
	];

	backControlPoints= 
	[
		[	
			[0,0,0.9,1],[-0.8,0,1,1],[-0.8,0,2,1],[0,0,2.1,1]
		],
		[	
			[0,0,0.9,1],[-0.3,-0.5,1,1],[-0.3,-0.5,2,1],[0,0,2.1,1]
		],
		[
			[0,0,0.9,1],[0.3,-0.5,1,1],[0.3,-0.5,2,1],[0,0,2.1,1]
		],
		[
			[0,0,0.9,1],[0.8,0,1,1],[0.8,0,2,1],[0,0,2.1,1]
		]
	];


	this.top = new MyPatch(this.scene,3,3,32,32,topControlPoints);
	this.back = new MyPatch(this.scene,3,3,32,32,backControlPoints);
};

MyStone.prototype.display = function(){
	this.displayStone();
}

MyStone.prototype.displayStone = function(){
	this.scene.pushMatrix();
	this.scene.graph.materials[this.colorMaterial].apply();

	if(this.picked || this.standByAnimationHeight != 0)
		this.standByAnimation();
	else if(this.moving)
		this.movementAnimation();

	this.scene.translate(0,0,-1.5);
	this.top.display();
	this.back.display();
	this.scene.popMatrix();
};


MyStone.prototype.standByAnimation = function(){
	var matrix = new mat4.create();
	if(this.standByAnimationHeight < 0){
		this.standByAnimationHeight = 0;
		return;
	}

	if(this.standByAnimationHeight == 0)
		this.standByAnimationVelocity = INITIAL_STANDBY_SPEED;

	this.standByAnimationHeight += this.standByAnimationVelocity;
	this.standByAnimationVelocity -= 0.015;
	mat4.translate(matrix, matrix, [0, this.standByAnimationHeight, 0]);
	mat4.rotate(matrix, matrix, (INITIAL_STANDBY_SPEED - this.standByAnimationVelocity)/INITIAL_STANDBY_SPEED * Math.PI, [1,0,0]);

	this.scene.multMatrix(matrix);
};


MyStone.prototype.moveStone = function(destination){
	this.moving = true;
	this.roundNumberAction = this.scene.stateMachine.game.roundNumber;

	this.movementInitialPosition = vec3.fromValues(this.position.x,this.position.y,this.position.z);
	this.movementFinalPosition = vec3.fromValues(destination.x, destination.y, destination.z);

	this.movementVector = vec3.create();
	vec3.sub(this.movementVector, this.movementFinalPosition, this.movementInitialPosition);
	var size = vec3.length(this.movementVector);
	vec3.normalize(this.movementVector, this.movementVector);
	vec3.scale(this.movementVector, this.movementVector, MOVEMENT_SPEED);

	this.movementSteps = (1/MOVEMENT_SPEED) * size;
	this.movementIteration = 0;
};

MyStone.prototype.movementAnimation = function(){

	if(this.movementSteps > this.movementIteration)
	{
		var ratio = this.movementIteration/this.movementSteps;
		var angle = ratio * (Math.PI/2) / 0.5;
		this.position = new Coords(this.movementInitialPosition[0] + this.movementVector[0]*this.movementIteration, 4*Math.sin(angle), this.movementInitialPosition[2] + this.movementVector[2]*this.movementIteration);
		this.movementIteration++;
	}
	else{
		this.moving = false;
		this.position = new Coords(this.movementFinalPosition[0], this.movementFinalPosition[1], this.movementFinalPosition[2]);
		this.scene.stateMachine.game.animation = false;

		if(this.roundNumberAction == this.scene.stateMachine.game.roundNumber)
			if(!this.scene.stateMachine.game.undo){
				this.scene.stateMachine.game.nextMove(this);
			}
				
			else
				this.scene.stateMachine.game.previousMove(this);
			
		this.scene.stateMachine.game.moveHasFinished = true;

	}
};

	