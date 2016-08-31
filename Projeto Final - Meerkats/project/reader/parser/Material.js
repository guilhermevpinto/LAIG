function Material(scene,id) {
    CGFappearance.call(this, scene);
    this.id = id;
};

Material.prototype = Object.create(CGFappearance.prototype);
Material.prototype.constructor = Material;

Material.prototype.setAppearance = function(shininess,specular,diffuse,ambient,emission){
	this.setShininess(shininess);
	this.setSpecular(specular[0],specular[1],specular[2],specular[3]);
	this.setDiffuse(diffuse[0],diffuse[1], diffuse[2],diffuse[3]);
	this.setAmbient(ambient[0],ambient[1],ambient[2],ambient[3]);
	this.setEmission(emission[0], emission[1], emission[2],emission[3]);
	this.setTextureWrap('REPEAT', 'REPEAT');
};
