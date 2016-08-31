/**
 * Interface
 * @constructor
 */
 
function Interface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**	@brief Inicializacao da interface
  */
Interface.prototype.init = function(application) {

	CGFinterface.prototype.init.call(this, application);

	this.gui = new dat.GUI();
	this.gui.open();
};




Interface.prototype.loadInterfaceBackgroundColor = function(){
    this.color = this.gui.addFolder('Background Color');
    this.color.open();

    var scene = this.scene;

    this.color.addColor(this.scene, 'BackgroundRGB' );

};


/**	@brief Carrega a GUI com os parametros a interagir, criando um handler para controlar o numero de jogadores
  */
Interface.prototype.loadInterfacePlayers = function(){
	this.players = this.gui.addFolder('Players');
    this.players.open();

    var scene = this.scene;
    this.humansListener = this.players.add(this.scene, 'Humans', 0, 4).step(1);
    this.botsListener = this.players.add(this.scene, 'Bots', 0, 4).step(1);
};


Interface.prototype.loadInterfaceGameFunctions = function(){
	this.game = this.gui.addFolder('Game');
    this.game.close();

    var scene = this.scene;

    this.game.add(this.scene.graph.gameStatus,'PASS TURN');
    this.game.add(this.scene.graph.gameStatus,'UNDO');
    this.game.add(this.scene.graph.gameStatus,'REPLAY');
    this.game.add(this.scene.graph.gameStatus,'EXIT');
};


Interface.prototype.loadInterfaceScenes = function(){
    this.scenes = this.gui.addFolder('Scenes');
    this.scenes.open();

    var scene = this.scene;
    var listener = this.scenes.add(this.scene.graph,'scenarios',this.scene.graph.scenarios).listen();
    listener.setValue("None");
    listener.onChange(function(cena){
        scene.changeScene(cena);
    });

};


Interface.prototype.loadInterfaceGameCameras = function(){
	this.camera = this.gui.addFolder('Cameras');
    this.camera.close();

    var scene = this.scene;

    var listener = this.camera.add(this.scene.cameraAnimation, 'Perspective', ['Player Perspective', 'Upper Perspective']);
    listener.onChange(function(option)
    {
    	var originalOrientation = vec3.fromValues(0,0,1);
    	var vectorOrientation = vec3.fromValues(scene.camera.position[0], 0, scene.camera.position[2]);
    	var angle  = Math.acos(vec3.dot(originalOrientation, vectorOrientation)/(vec3.length(vectorOrientation) * vec3.length(originalOrientation)));

    	if(option == 'Upper Perspective')
    		scene.cameraAnimation.startCameraAnimation(2000, vec3.fromValues(0.5*Math.sin(angle),50,0.5*Math.cos(angle)), vec3.fromValues(0,0,0));
    	else 
    		scene.cameraAnimation.startCameraAnimation(2000, vec3.fromValues(33*Math.sin(angle),25,33*Math.cos(angle)), vec3.fromValues(0,0,0));
    });

};


Interface.prototype.setScene = function(scene) {
    this.scene = scene;
};

Interface.prototype.processKeyDown = function(event) {
    console.log(event);
    switch(event.keyIdentifier){
        case 'Enter':
            if(this.scene.stateMachine.currentState == 'Gameplay')
                this.scene.stateMachine.game.passTurn();
            else if(this.scene.stateMachine.currentState == 'EndScreen')
                this.scene.stateMachine.exit();
            else if(this.scene.stateMachine.currentState == 'How To')
             {
                this.scene.cameraAnimation.startCameraAnimation(1500, vec3.fromValues(0, 40, 15), vec3.fromValues(0, 50, 0));
                this.scene.stateMachine.currentState = 'How To to Main Menu';
             }
            break;
        case 'U+001B':
             if(this.scene.stateMachine.currentState == 'How To')
             {
                this.scene.cameraAnimation.startCameraAnimation(1500, vec3.fromValues(0, 40, 15), vec3.fromValues(0, 50, 0));
                this.scene.stateMachine.currentState = 'How To to Main Menu';
             }
             else if(this.scene.stateMachine.currentState == 'Gameplay' || this.scene.stateMachine.currentState == 'EndScreen') 
                this.scene.stateMachine.exit();
        default: break;
    }
}