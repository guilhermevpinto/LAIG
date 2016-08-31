function Graph() {
	this.root = [];
	this.initials = new Initials();
	this.illumination = new Illumination();
	this.lights = [];
    this.materials = [];
    this.textures = [];
    this.leaves = [];
	this.nodes = [];
	this.lightsStateValue = [];
	this.animations = [];
	//this.Players = [];
	this.gameStatus = [];
	this.scenarios = ['None'];
	this.pickID = 1;
};


Graph.prototype = Object.create(Object.prototype);
Graph.prototype.constructor = Graph;

