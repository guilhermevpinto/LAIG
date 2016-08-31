/**
 * MyPatch
 * @constructor
 */
function MyPatch(scene,orderU,orderV,partsU,partsV,controllpoints) {
	CGFobject.call(this,scene);
	this.orderU = orderU;
	this.orderV = orderV;
	this.controllpoints = controllpoints;
	//console.log(controllpoints);

	var surface = this.makeSurface();
	getSurfacePoint = function(u, v) {
		return surface.getPoint(u, v);
	};
	this.patch = new CGFnurbsObject(scene,getSurfacePoint,partsU,partsV);
};
MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor = MyPatch;


MyPatch.prototype.makeSurface = function(){
	var knotsU = [];
	var knotsV = [];

	///push knotsU
	for(var i = 0 ; i < this.orderU + 1;i++)
		knotsU.push(0);
	for(var i = 0 ; i < this.orderU + 1;i++)
		knotsU.push(1);
	///push knotsV
	for(var i = 0 ; i < this.orderV + 1;i++)
		knotsV.push(0);
	for(var i = 0 ; i < this.orderV + 1;i++)
		knotsV.push(1);

	return new CGFnurbsSurface(this.orderU, this.orderV, knotsU, knotsV, this.controllpoints);

};

MyPatch.prototype.display = function(){
	this.patch.display();
}

MyPatch.prototype.updateTextCoords = function(ampS,ampT){
	//this.updateTexCoordsGLBuffers();
};
