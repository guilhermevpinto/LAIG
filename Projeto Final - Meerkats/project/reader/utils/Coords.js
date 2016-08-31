/**
 * Coords
 * @constructor
 */

function Coords(Xcoord, Ycoords,Zcoord) {
	this.x = Xcoord;
	this.y=Ycoords;
	this.z=Zcoord;
};

Coords.prototype.equals = function(that){
	return this.x == that.x && this.y == that.y && this.z == that.z;
}