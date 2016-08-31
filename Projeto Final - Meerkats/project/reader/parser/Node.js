
function Node(id, material, texture, matrix, descendants, animations) {
	this.id = id;
	this.material = material;
	this.texture = texture;
	this.matrix = matrix; // matriz de transformação do node que se aplicam no display da cena
	this.originalMatrix = matrix; // matrix original do node
	this.descendants = descendants;
	this.animations = animations;
};

Node.prototype.constructor = Node;
Node.prototype = Object.create(Object.prototype);

Node.prototype.applyAnimations = function (scene) {
	var stackingSpan = 0;

	for(var i = 0; i < this.animations.length; i++)
		if(scene.milliseconds <= scene.graph.animations[this.animations[i]].span + stackingSpan)
		{
			this.matrix = scene.graph.animations[this.animations[i]].updateNodeMatrix(this.originalMatrix, scene.milliseconds - stackingSpan);
			break;
		}
		else stackingSpan += scene.graph.animations[this.animations[i]].span;
};