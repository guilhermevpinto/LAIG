/**
 * MyBoardTile
 * @constructor
 */
function MyBoardTile(scene, id, position, row, col) {
	CGFobject.call(this,scene);
	this.id = id;
	this.scene = scene;
	this.row = row;
	this.col = col;
	this.topTexture = "topTile";
	this.topTextureHighlight = 'topTileHighlight';
	this.midTexture = "botTile";
	this.position = position;
	this.info = 0;
	this.topArgs=[0,1,1,6,6];
	this.midArgs=[0.3,1,1,6,6];
	this.highlight = false;
	this.topHexagon = new MyCylinder(this.scene, this.topArgs);
	this.midHexagon = new MyCylinder(this.scene, this.midArgs);
};


MyBoardTile.prototype = Object.create(CGFobject.prototype);
MyBoardTile.prototype.constructor = MyBoardTile;


MyBoardTile.prototype.display = function(){

	this.scene.pushMatrix();
	this.scene.translate(0,-0.2,0);
	this.scene.rotate(-Math.PI/2,1,0,0);
	this.scene.rotate(-Math.PI/2,0,0,1);
	
	
	if(this.highlight)
		{
			this.scene.graph.materials['iluminated'].apply();
			this.scene.graph.textures[this.topTextureHighlight].bind();
		}
	else	
		{
			this.scene.defaultAppearance.apply();
			this.scene.graph.textures[this.topTexture].bind();
		}
	this.scene.pushMatrix();
	this.scene.translate(0,0,0.31);
	this.topHexagon.display();
	this.scene.popMatrix();
	this.scene.graph.textures[this.topTexture].unbind();

	this.scene.graph.textures[this.midTexture].bind();
	this.scene.pushMatrix();
	this.midHexagon.display();
	this.scene.popMatrix();
	this.scene.graph.textures[this.midTexture].unbind();

	this.scene.popMatrix();
};