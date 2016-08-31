
function LSXreader(filename, scene) {
	this.loadedOk = null;
	
	this.scene = scene;
	scene.LSXreader = this;

	this.reader = new CGFXMLreader();
	
	this.reader.open('scenes/'+filename, this);  
};


/**	@brief Faz o parsing de todos os elementos do ficheiro LSX e verifica se tudo foi lido com sucesso
*/
LSXreader.prototype.onXMLReady=function() {
	console.log("LSX Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	var error = this.parseElements(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	this.scene.onGraphLoaded();
};


/**	@brief Faz o parsing de todos os elementos do ficheiro LSX apartir de um root element
  *	@param rootElement elemento por onde se vai iniciar a leitura dos elementos
  */
LSXreader.prototype.parseElements= function(rootElement) {

  	var elems = rootElement.getElementsByTagName('SCENE');
  	if(elems == null) { 
  		return "SCENE tag ig missing";
  	}

  	if((elems = this.parseInitials(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseIllumination(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseLights(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseTextures(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseMaterials(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseAnimations(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseLeaves(rootElement)) != 0)
  		return elems;

  	if((elems = this.parseNodes(rootElement)) != 0)
  		return elems;
  };


/**	@brief Faz o parsing das inicials do ficheiro LSX
  *	@param rootElement elemento por onde se inicia o parse das Initials 
  */
LSXreader.prototype.parseInitials= function(rootElement) {

  	var initials = rootElement.getElementsByTagName('INITIALS');

  	if(initials == null){
  		return "INITIALS tag is missing.";
  	}

  	var frustum = initials[0].getElementsByTagName('frustum');
  	if(frustum == null) {
  		return "frustum tag is missing.";
  	}

  	var translation = initials[0].getElementsByTagName('translation');
  	if(translation == null) {
  		return "translation tag is missing.";
  	}

  	var rotations = initials[0].getElementsByTagName('rotation');
  	if(rotations == null){
  		return "rotation tag is missing.";
  	}
  	else if(rotations.length != 3){
  		return "Insuficient info for the scene initial rotation.";
  	}

  	var rotationX, rotationY, rotationZ, i;
  	var num_x,num_y,num_z;

  	for(i = 0; i < 3; i++)
  		if(this.reader.getString(rotations[i], 'axis', 1) == 'x'){
  			num_x = true;
  			rotationX = rotations[i]; 
  		}
  		else if(this.reader.getString(rotations[i], 'axis', 1) == 'y'){
  			num_y = true;
  			rotationY = rotations[i];
  		}
  		else if(this.reader.getString(rotations[i], 'axis', 1) == 'z'){
  			num_z = true;
  			rotationZ = rotations[i];
  		}
  		if(num_x!=true ||num_y!=true|| num_z!=true)
  			throw "Invalid coordenates of INITIALS rotation!";

  		var scale = initials[0].getElementsByTagName('scale');
  		if(scale == null){
  			return "scale tag is missing.";
  		}

  		var reference = initials[0].getElementsByTagName('reference');
  		if(reference == null){
  			return "reference tag is missing.";
  		}


  		var initialFrustum = {
  			near: this.reader.getFloat(frustum[0], 'near', 1),
  			far:  this.reader.getFloat(frustum[0], 'far', 1)
  		};

  		if(this.isBadInteger(initialFrustum.near,initialFrustum.far)){
  			throw "Initial frustum is wrong! They are not numbers. Your values: near="+initialFrustum.near+" far="+ initialFrustum.far;
  		}

  		if(initialFrustum.near == 0){
  			throw "Frustum near value can't be 0.";
  		}

  		if(initialFrustum.near > initialFrustum.far){
  			throw "Frustum near value is higher than frustum far value! near ="+initialFrustum.near+" far="+ initialFrustum.far;
  		}

  		var initialTranslation = vec3.fromValues(this.reader.getFloat(translation[0], 'x', 1), 
  			this.reader.getFloat(translation[0], 'y', 1), 
  			this.reader.getFloat(translation[0], 'z', 1));

  		if(this.isBadInteger(initialTranslation[0],initialTranslation[1],initialTranslation[2]))
  			throw "Initial translation is wrong! Something went wrong. Your values: x="+initialTranslation[0]+" y="+ initialTranslation[1]+ " z="+initialTranslation[2];

  		rotationX= this.reader.getFloat(rotationX, 'angle', 1);
  		rotationY= this.reader.getFloat(rotationY, 'angle', 1);
  		rotationZ= this.reader.getFloat(rotationZ, 'angle', 1);

  		if(this.isBadInteger(rotationX,rotationY,rotationZ))
  			throw "Initial rotation is wrong! Something went wrong. Your values: Rotation in axis X: "+ rotationX+" Rotation in axis Y: "+ rotationY+ " Rotation in axis Z: "+ rotationZ;

  		var initialScale = vec3.fromValues(this.reader.getFloat(scale[0], 'sx', 1), 
  			this.reader.getFloat(scale[0], 'sy', 1), 
  			this.reader.getFloat(scale[0], 'sz', 1));

  		if(this.isBadInteger(initialScale[0],initialScale[0],initialScale[0]))
  			throw "Initial scale is wrong! Something went wrong. Your values: Scale in axis X: "+ initialScale[0]+" Scale in axis Y: "+ initialScale[1]+" Scale in axis Z: "+ initialScale[2];

  		var refLength = this.reader.getFloat(reference[0], 'length', 1);

  		if(this.isBadInteger(refLength) || refLength <0)
  			throw ("Initial Reference Length is wrong! Something went wrong. Your values: " +" reference length: "+ refLength);


  		this.scene.graph.initials.setFrustum(initialFrustum.near,initialFrustum.far);
  		this.scene.graph.initials.translateMatrix(initialTranslation);
  		this.scene.graph.initials.rotateMatrix('x',rotationX);
  		this.scene.graph.initials.rotateMatrix('y',rotationY);
  		this.scene.graph.initials.rotateMatrix('z',rotationZ);
  		this.scene.graph.initials.scaleMatrix(initialScale);
  		this.scene.graph.initials.setReferenceLength(refLength);

  		return 0;
  	};


/**	@brief Faz o parsing da Illumination do ficheiro LSX
  *	@param rootElement elemento por onde se inicia o parse das variáveis de Illumination 
  */
LSXreader.prototype.parseIllumination= function(rootElement) {

  	var illumination = rootElement.getElementsByTagName('ILLUMINATION');

  	if(illumination == null) {
  		return "ILLUMINATION tag is missing.";
  	}

  	var ambient = illumination[0].getElementsByTagName('ambient');
  	if(ambient == null){
  		return "ambient tag is missing.";
  	}

  	var backgroundColor = illumination[0].getElementsByTagName('background');
  	if(backgroundColor == null){
  		return "background tag is missing";
  	}

  	var background = [];
  	var globalAmbient = [];	

  	background[0] = this.reader.getFloat(backgroundColor[0], 'r', 1);
  	background[1] = this.reader.getFloat(backgroundColor[0], 'g', 1);
  	background[2] = this.reader.getFloat(backgroundColor[0], 'b', 1);
  	background[3] = this.reader.getFloat(backgroundColor[0], 'a', 1);

  	if(this.isBadRGBA(background[0],background[1],background[2],background[3]))
  		throw "Illumination background is wrong! Your values are: "+"r= "+background[0]+ " g="+background[1]+" b="+background[2]+" a="+background[3];

  	globalAmbient[0] = this.reader.getFloat(ambient[0], 'r', 1);;
  	globalAmbient[1] = this.reader.getFloat(ambient[0], 'g', 1);;
  	globalAmbient[2] = this.reader.getFloat(ambient[0], 'b', 1);
  	globalAmbient[3] = this.reader.getFloat(ambient[0], 'a', 1);;

  	if(this.isBadRGBA(globalAmbient[0],globalAmbient[1],globalAmbient[2],globalAmbient[3]))
  		throw "Illumination ambient is wrong! Your values are: "+"r= "+globalAmbient[0]+ " g="+globalAmbient[1]+" b="+globalAmbient[2]+" a="+globalAmbient[3];

  	this.scene.graph.illumination.background = background;
  	this.scene.graph.illumination.ambient = globalAmbient;

  	return 0;
};	


/**	@brief Faz o parsing da Lights do ficheiro LSX
  *	@param rootElement elemento a partir do qual se inicia o parse das lights
  */	
LSXreader.prototype.parseLights= function(rootElement) {

	var lightsTag = rootElement.getElementsByTagName('LIGHTS');

	if(lightsTag == null) {
		return "LIGHTS tag is missing.";
	}

	var lights = lightsTag[0].getElementsByTagName('LIGHT');
	if(lights.length > 8) {
		return "There are too many lights";
	}
	else if(lights[0] == null) 
	{
		return "No LIGHT was added.";
	}

	var i, aux;
	for(i=0; i < lights.length; i++) {

		var id = this.reader.getString(lights[i], 'id', 1);
		if(id == null)
			throw "LIGHT \""+ i+"\" does no have the id tag!";

		aux = lights[i].getElementsByTagName('enable');
		var value = this.reader.getBoolean(aux[0], 'value', 1);

		if(this.isBadBoolean(value)){
			throw "The light \""+ id+"\" value is wrong or it is not well written! It should be a boolean value of 0 or 1 and the sintax for exampl <enable value=\"1\" />";
		}


		aux = lights[i].getElementsByTagName('position');
		var position = [this.reader.getFloat(aux[0], 'x', 1),
		this.reader.getFloat(aux[0], 'y', 1),
		this.reader.getFloat(aux[0], 'z', 1),
		this.reader.getFloat(aux[0], 'w', 1)];

		if(this.isBadInteger(position[0],position[1],position[2]))
			throw "Light \""+ id+"\" position is wrong or the tag name is missing! It shoud be <position r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";

		aux = lights[i].getElementsByTagName('ambient');
		var ambient= [this.reader.getFloat(aux[0], 'r', 1), 
		this.reader.getFloat(aux[0], 'g', 1), 
		this.reader.getFloat(aux[0], 'b', 1), 
		this.reader.getFloat(aux[0], 'a', 1)];

		if(this.isBadRGBA(ambient[0],ambient[1],ambient[2],ambient[3]))
			throw "Light \""+ id+"\" ambient is wrong or the tag name is missing! It shoud be It shoud be <ambient r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";

		aux = lights[i].getElementsByTagName('diffuse');
		var diffuse = [this.reader.getFloat(aux[0], 'r', 1), 
		this.reader.getFloat(aux[0], 'g', 1), 
		this.reader.getFloat(aux[0], 'b', 1), 
		this.reader.getFloat(aux[0], 'a', 1)];

		if(this.isBadRGBA(diffuse[0],diffuse[1],diffuse[2],diffuse[3]))
			throw "Light \""+ id+"\" diffuse is wrong or the tag name is missing! It shoud be for example: It shoud be <diffuse r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";

		aux = lights[i].getElementsByTagName('specular');
		var specular = [this.reader.getFloat(aux[0], 'r', 1), 
		this.reader.getFloat(aux[0], 'g', 1), 
		this.reader.getFloat(aux[0], 'b', 1), 
		this.reader.getFloat(aux[0], 'a', 1)];

		if(this.isBadRGBA(specular[0],specular[1],specular[2],specular[3]))
			throw "Light \""+ id+"\" specular is wrong or the tag name is missing! It shoud be <specular r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";


		var light = new Light(this.scene, i, id, value);
		light.setPosition(position[0],position[1],position[2],position[3]);
		light.setAmbient(ambient[0],ambient[1],ambient[2],ambient[3]);
		light.setDiffuse(diffuse[0],diffuse[1],diffuse[2],diffuse[3]);
		light.setSpecular(specular[0],specular[1],specular[2],specular[3]);
		light.setVisible(true);

		this.scene.graph.lights.push(light);
	}	
	return 0;
};


/**	@brief Faz o parsing da textures do ficheiro LSX
  *	@param rootElement elemento a partir do qual se inicia o parse das textures
  */	
LSXreader.prototype.parseTextures= function(rootElement) {

	var texturesTag = rootElement.getElementsByTagName('TEXTURES');

	if(texturesTag == null) {
		return "TEXTURES tag is missing.";
	}

	var textures = texturesTag[0].getElementsByTagName('TEXTURE');
	if(textures == null) {
		return "No texture was added.";
	}

	var textureInfo = [];
	var i;
	for(i = 0; i < textures.length; i++) {

		var id = this.reader.getString(textures[i], 'id', 1);

		if(id == null)
			throw "Texture \""+ i+"\" does no have the id tag!";

		var file = textures[i].getElementsByTagName('file');
		textureInfo['path'] = this.reader.getString(file[0], 'path', 1);

		var amplif_factor = textures[i].getElementsByTagName('amplif_factor');
		textureInfo['amplif_factor'] = [this.reader.getFloat(amplif_factor[0], 's', 1), 
		this.reader.getFloat(amplif_factor[0], 't', 1)];
		if(this.isBadInteger(textureInfo['amplif_factor'][0],textureInfo['amplif_factor'][1]))
			throw "Texture \""+ id+"\" amplif_factor is wrong or the tag name is missing! It shoud be for example: <amplif_factor s=\"0.5\" t=\"0.5\" />";

		var newTexture = new Texture(this.scene, textureInfo['path'], id, textureInfo['amplif_factor']);
		this.scene.graph.textures[id] = newTexture;
	}

	return 0;
};


/**	@brief Faz o parsing dos Materials do ficheiro LSX
  *	@param rootElement elemento a partir do qual se inicia o parse dos Materiais
  */	
LSXreader.prototype.parseMaterials= function(rootElement) {

	var materialsTag = rootElement.getElementsByTagName('MATERIALS');

	if(materialsTag == null) {
		return "MATERIALS tag is missing.";
	}

	var materials = materialsTag[0].getElementsByTagName('MATERIAL');
	if(materials == null) {
		return "No MATERIAL was added.";
	}

	var material = [];
	var i;

	for(i = 0; i < materials.length; i++) {
		var id = this.reader.getString(materials[i], 'id', 1);
		if(id == null)
			throw "Material \""+ i+"\" does no have the id tag!";


		var shininess = materials[i].getElementsByTagName('shininess');
		material['shininess'] = this.reader.getFloat(shininess[0], 'value', 1);

		if(this.isBadInteger(material['shininess']))
			throw "Material \""+ id+"\" shininess is wrong or the tag name is missing! It shoud be for example: <shininess value=\"ff\" />";

		var specular = materials[i].getElementsByTagName('specular');
		material['specular'] = [this.reader.getFloat(specular[0], 'r', 1), 
		this.reader.getFloat(specular[0], 'g', 1), 
		this.reader.getFloat(specular[0], 'b', 1), 
		this.reader.getFloat(specular[0], 'a', 1)];

		if(this.isBadRGBA(material['specular'][0],material['specular'][1],material['specular'][2],material['specular'][3]))
			throw "Material \""+ id+"\" specular is wrong or the tag name is missing! It shoud be for example:  <specular r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";

		var diffuse = materials[i].getElementsByTagName('diffuse');
		material['diffuse'] = [this.reader.getFloat(diffuse[0], 'r', 1), 
		this.reader.getFloat(diffuse[0], 'g', 1), 
		this.reader.getFloat(diffuse[0], 'b', 1), 
		this.reader.getFloat(diffuse[0], 'a', 1)];

		if(this.isBadRGBA(material['diffuse'][0],material['diffuse'][1],material['diffuse'][2],material['diffuse'][3]))
			throw "Material \""+ id+"\" diffuse is wrong or the tag name is missing! It shoud be for example:  <diffuse r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";


		var ambient = materials[i].getElementsByTagName('ambient');
		material['ambient'] = [this.reader.getFloat(ambient[0], 'r', 1), 
		this.reader.getFloat(ambient[0], 'g', 1), 
		this.reader.getFloat(ambient[0], 'b', 1), 
		this.reader.getFloat(ambient[0], 'a', 1)];

		if(this.isBadRGBA(material['ambient'][0],material['ambient'][1],material['ambient'][2],material['ambient'][3]))
			throw "Material \""+ id+"\" ambient is wrong or the tag name is missing! It shoud be for example:  <ambient r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";


		var emission = materials[i].getElementsByTagName('emission');
		material['emission'] = [this.reader.getFloat(emission[0], 'r', 1), 
		this.reader.getFloat(emission[0], 'g', 1), 
		this.reader.getFloat(emission[0], 'b', 1), 
		this.reader.getFloat(emission[0], 'a', 1)];

		if(this.isBadRGBA(material['emission'][0],material['emission'][1],material['emission'][2],material['emission'][3]))
			throw "Material \""+ id+"\" emission is wrong or the tag name is missing! It shoud be for example:  <emission r=\"ff\" g=\"ff\" b=\"ff\" a=\"ff\" />";

		var newMaterial = new Material(this.scene,id);
		newMaterial.setAppearance(material['shininess'],material['specular'],material['diffuse'],material['ambient'],material['emission']);
		this.scene.graph.materials[id] = newMaterial;
	}

	return 0;
};


LSXreader.prototype.parseAnimations= function(rootElement) {

  var animationsTag = rootElement.getElementsByTagName('animations');

  if(animationsTag.length == 0){
  	return "animations tag is missing";
  }

	animationsTag = animationsTag[0];

	for(var i = 0; i < animationsTag.children.length; i++){

		if(animationsTag.children[i].tagName != 'animation'){
			return "Unknown tag name in animations section: " + animationsTag.children[i].tagName;
		}

		var id = this.reader.getString(animationsTag.children[i], 'id', 1);

		if(this.scene.graph.animations[id] != null){
			return "There are two or more animations with the following id: " + id;
		}

		var type = this.reader.getString(animationsTag.children[i], 'type', 1);

		if(type != 'linear' && type != 'circular'){
			return "Unknown animation type: " + type;
		}

  	//already stores the value in milliseconds
  	var span = (this.reader.getFloat(animationsTag.children[i], 'span', 1)) * 1000;

  	if(type == 'linear'){
  		var controls = animationsTag.children[i].getElementsByTagName('controlpoint');

  		if(controls == null){
  			return "Any controlpoints were added to animation: " + id;
  		}
  		else if(controls < 2){
  			return "Insuficient number of controlpoints for animation " + id;
  		}

  		var controlpoints = [];
  		for(var j = 0 ; j < controls.length; j++){
  			var xx = this.reader.getFloat(controls[j], 'xx', 1);
  			var yy = this.reader.getFloat(controls[j], 'yy', 1);
  			var zz = this.reader.getFloat(controls[j], 'zz', 1);
  			var control = vec3.fromValues(xx, yy, zz);
  			controlpoints.push(control);
  		}			


  		this.scene.graph.animations[id] = new LinearAnimation(id, span, controlpoints);
  	}
  	else{
  		var temp = this.getArgs(animationsTag.children[i], 'center', 1);
  		if(temp.length != 3){
  			return "wrong number of coordinates for center point on the animation " + id;
  		}
  		var center = vec3.fromValues(temp[0], temp[1], temp[2]);

  		var radius = this.reader.getFloat(animationsTag.children[i], 'radius', 1);

  		var startang = this.reader.getFloat(animationsTag.children[i], 'startang', 1) * Math.PI / 180;

  		var rotang = this.reader.getFloat(animationsTag.children[i], 'rotang', 1) * Math.PI / 180;

  		this.scene.graph.animations[id] = new CircularAnimation(id, span, center, radius, startang, rotang);
  	}
  }

  return 0;
};


/**	@brief Faz o parsing da Leaves do ficheiro LSX
  *	@param rootElement elemento a partir do qual se inicia o parse das leaves
  */	
LSXreader.prototype.parseLeaves= function(rootElement) {
	var leavesTag = rootElement.getElementsByTagName('LEAVES');
	if(leavesTag == null){
		return "LEAVES tag is missing.";
	}

	var leaves = leavesTag[0].getElementsByTagName('LEAF');
	if(leaves == null){
		return "No LEAF was added.";
	}

  	var i;

	for(i = 0; i < leaves.length; i++){

  		var id = this.reader.getString(leaves[i], 'id', 1);
  		if(id == null)
  			throw "Leave \""+ i+"\" does no have the id tag!";

  		var type = this.reader.getString(leaves[i], 'type', 1);

  		if(type == "rectangle"){
  			var args = this.getArgs(leaves[i], 'args', 1);
  			this.scene.graph.leaves[id] = new MyRectangle(this.scene, args);
  		}
  		else if(type == "sphere") {
  			var args = this.getArgs(leaves[i], 'args', 1);
  			this.scene.graph.leaves[id] = new MySphere(this.scene, args);
  		}
  		else if(type == "invertedSphere") {
  			var args = this.getArgs(leaves[i], 'args', 1);
  			this.scene.graph.leaves[id] = new MyInvertedSphere(this.scene, args);
  		}
  		else if(type == "cylinder"){
  			var args = this.getArgs(leaves[i], 'args', 1);
  			this.scene.graph.leaves[id] = new MyCylinder(this.scene, args);
  		}
  		else if(type == "triangle"){
  			var args = this.getArgs(leaves[i], 'args', 1);
  			this.scene.graph.leaves[id] = new MyTriangle(this.scene, args);
  		}
  		else if(type == "plane"){
  			var args = this.getArgs(leaves[i], 'args', 1);
  			if(args[0] <=0 ||args[1]<=0 || this.isBadInteger(args[0])||this.isBadInteger(args[1]))
  				return "The LEAF " + id + " has no parts!";

  			this.scene.graph.leaves[id] = new MyPlane(this.scene, args[0], args[1]);
  		}
  		else if(type == "patch"){

  			var args = this.getArgs(leaves[i], 'args', 1);
  			if(args[0]<=0 || this.isBadInteger(args[0])||
  				args[1]<=0 || this.isBadInteger(args[1])||
  				 args[2]<=0 || this.isBadInteger(args[2])||
  				  args[3]<=0 || this.isBadInteger(args[3]))
  				return "Invalid Patch arguments!";

  			var controlpoints = leaves[i].getElementsByTagName('controlpoint');

  			if(controlpoints.length != (args[0]+1)*(args[1]+1))
  				return "The LEAF "+id+" has wrong number of controlpoints!";

  			var finalControlPoints = this.parseControlPoints(args[0],args[1],controlpoints);
			this.scene.graph.leaves[id] = new MyPatch(this.scene, args[0],args[1],args[2],args[3],finalControlPoints);
  		}
  		else if(type == "bag"){

  			var args = this.getArgs(leaves[i], 'args', 1);
  			if(args[0]<=0 || this.isBadInteger(args[0])||
  				args[1]<=0 || this.isBadInteger(args[1])||
  				 args[2]<=0 || this.isBadInteger(args[2])||
  				  args[3]<=0 || this.isBadInteger(args[3]))
  				return "Invalid bag arguments!";

  			var controlpoints = leaves[i].getElementsByTagName('controlpoint');

  			if(controlpoints.length != (args[0]+1)*(args[1]+1))
  				return "The LEAF "+id+" has wrong number of controlpoints!";

  			var finalControlPoints = this.parseControlPoints(args[0],args[1],controlpoints);
			this.scene.graph.leaves[id] = new MyBag(this.scene, args[0],args[1],args[2],args[3],finalControlPoints);
	  	}
	    else if(type == "terrain"){

			var texture = this.reader.getString(leaves[i], 'texture', 1);
			if(this.scene.graph.textures[texture] == null){
			return "Invalid texture " + texture + " for terrain " + id + ".";
			}
			var heightmap = this.reader.getString(leaves[i], 'heightmap', 1);
			if(this.scene.graph.textures[heightmap] == null){
			return "Invalid heightmap " + heightmap + " for terrain " + id + ".";
			}
			this.scene.graph.leaves[id] = new MyTerrain(this.scene, texture, heightmap);
	    }
	    else if(type == "vehicle"){

			var engineTexture = this.reader.getString(leaves[i], 'engine', 1);
			if(this.scene.graph.textures[engineTexture] == null)
			return "Invalid engine texture for vehicle";
			var spaceshipTexture = this.reader.getString(leaves[i], 'spaceship', 1);
			if(this.scene.graph.textures[spaceshipTexture] == null)
			return "Invalid spaceship texture for vehicle";
			var flameTexture = this.reader.getString(leaves[i], 'flame', 1);
			if(this.scene.graph.textures[flameTexture] == null)
			return "Invalid flame texture for vehicle";
 			this.scene.graph.leaves[id] = new MyVehicle(this.scene, engineTexture, spaceshipTexture, flameTexture);
	    }
	    else if(type == "board"){

	 		this.scene.graph.leaves[id] = new MyBoard(this.scene);
	  }
	  else return "ERROR: unexistent leaf type: " + type;
	} 

  return 0; 
};


/**	@brief Faz o parsing dos control points do patch do ficheiro LSX
  *	@param controlpointsElement elemento a partir do qual se inicia o parse dos control points
  */
LSXreader.prototype.parseControlPoints= function(orderU,orderV,controlpointsElement) {

	var controlpoints = [];
	var tempcontrolpoints=[];
	var points = [];
	var pos = 0;

	//ficam aqui todos os pontos dos controll points
	for(var U = 0; U < controlpointsElement.length;U++){
			var x =this.getArgs(controlpointsElement[U],'x',1);
			var y = this.getArgs(controlpointsElement[U],'y',1);
			var z = this.getArgs(controlpointsElement[U],'z',1);
			points.push([x[0],y[0],z[0],1]);
		}

		//todos os pontos ficam como devem estar
		var pos = 0;
		for(var U = 0; U < orderU+1; U++){
			for(var V =0; V < orderV+1; V++){
				tempcontrolpoints.push(points[pos]);
				pos++;
			}
			controlpoints.push(tempcontrolpoints);
			tempcontrolpoints=[];
		}
		//tem de ser reverse para ficar em Y+  return controlpoints.reverse();
	return controlpoints;
}


/**	@brief Faz o parsing dos Nodes do ficheiro LSX
  *	@param rootElement elemento a partir do qual se inicia o parse dos Nodes
  */	
LSXreader.prototype.parseNodes= function(rootElement) {
	var nodesTag = rootElement.getElementsByTagName('NODES');
	if(nodesTag == null){
		return "NODES tag is missing.";
	}
	//this.scene.graph.scenarios['Scenes']=[];
	var root = nodesTag[0].getElementsByTagName('ROOT');
	if(root != null){
		for(var i = 0; i < root.length; i++)
		{
			var rootID = this.reader.getString(root[i], 'id', 1);
			if(rootID == 'Main Menu')
				this.scene.graph.root['Main Menu'] = 'Main Menu';
			else if(rootID == 'Gameplay')
				this.scene.graph.root['Gameplay'] = 'Gameplay';
			else{
				if(this.scene.graph.root[rootID]!=null)
					return "Invalid rootID! That rootID already exists!";
				else{
					this.scene.graph.root[rootID]= rootID;
					this.scene.graph.scenarios.push(rootID);

				}
					
			} 

				/*return 'Invalid root ID (expected "Main Menu" or "Gameplay")';*/
		}
	}
	else return "ROOT tag is missing.";

	var nodes = nodesTag[0].getElementsByTagName('NODE');
	if(nodes == null){
		return "No NODE was added.";
	}

	var i;
	for(i = 0; i < nodes.length; i++){
		var result = this.readNode(nodes[i]);

		if(result != 0)
			return result;
	}

};


/**	@brief Função auxiliar da função parseNodes(rootElement) que faz o read de todos os valores de um determinado node
  *	@param nodeTag tag do node ao qual se pretende ler todos os seus valores
  */	
LSXreader.prototype.readNode = function(nodeTag) {

	var id = this.reader.getString(nodeTag, 'id', 1);
	var materialID, textureID, pickable;

	if(nodeTag.children[0].tagName == 'MATERIAL')
	{
		materialID = this.reader.getString(nodeTag.children[0], 'id', 1);

		if(!(materialID in this.scene.graph.materials) && (materialID != 'null'))
			return "The material " + materialID + " doesn't exist!"; 
	}	
	else return "MATERIAL tag is missing on NODE specifications.";

	if(nodeTag.children[1].tagName == 'TEXTURE')
	{
		textureID = this.reader.getString(nodeTag.children[1], 'id', 1);
		if(!(textureID in this.scene.graph.textures) && (textureID != 'null' && textureID != 'clear'))
			return "The texture " + textureID + " doesn't exist!"; 
	}
	else return "TEXTURE tag is missing on NODE specifications.";

	var pick = nodeTag.getElementsByTagName('PICKABLE');
	if(pick.length != 0)
	{
		pickable = this.reader.getBoolean(pick[0], 'check', 1);
	}
	else pickable = false;

	if(nodeTag.getElementsByTagName('DESCENDANTS') == null){
		return "DESCENDANTS tag is missing.";
	}

	var descendants = (nodeTag.children[nodeTag.children.length - 1]).getElementsByTagName('DESCENDANT');

	var k, desc = [];
	for(k=0; k < descendants.length;k++){
		desc.push(this.reader.getString(descendants[k], 'id', 1));
	}

	var numTransformations = nodeTag.children.length - 3;
	var mat = this.readNodeTransformations(numTransformations, nodeTag);
	var animations = this.readNodeAnimations(id, nodeTag);

	var newNode = new Node(id, materialID, textureID, mat, desc, animations, pickable);

	this.scene.graph.nodes[id] = newNode;


	return 0;
};


/**	@brief Função auxiliar da função readNode(nodeTag) que faz o read de todas as transformação associadas ao nodeTag
  *	@param numTransformations numero de transformações associadas ao node
  *	@param nodeTag tag do node ao qual se pretende ler as transformações
  */
LSXreader.prototype.readNodeTransformations = function(numTransformations, nodeTag) {

	var mat = mat4.create();

	for(j = 0; j < numTransformations; j++){

		var elem = nodeTag.children[j+2];

		if(elem.tagName == 'TRANSLATION')
		{
			var x,y,z;
			x= this.reader.getFloat(elem, 'x', 1);
			y= this.reader.getFloat(elem, 'y', 1);
			z= this.reader.getFloat(elem, 'z', 1);
			if(this.isBadInteger(x,y,z))
				throw "Node "+ nodeTag+" transformation is wrong!";
			mat4.translate(mat,mat,[x,y,z]);
		}
		else if(elem.tagName == 'ROTATION')
		{
			var angle;

			angle = this.reader.getFloat(elem,'angle',1);

			if(this.reader.getString(elem, 'axis', 1) == 'x')
				mat4.rotateX(mat, mat, angle *Math.PI/180);
			else if(this.reader.getString(elem, 'axis', 1) == 'y')
				mat4.rotateY(mat, mat, angle*Math.PI/180);
			else if(this.reader.getString(elem, 'axis', 1) == 'z')
				mat4.rotateZ(mat, mat, angle*Math.PI/180);
			else return "Error on node id: "+node['id']+" rotation AXIS!!";
		}
		else if(elem.tagName == 'SCALE')
		{
			var array = new Array();
			array.push(this.reader.getFloat(elem, 'sx', 1));
			array.push(this.reader.getFloat(elem, 'sy', 1));
			array.push(this.reader.getFloat(elem, 'sz', 1)); 

			mat4.scale(mat,mat,array);
		}
	}

	return mat;
};


/**	@brief Função auxiliar da função readNode(nodeTag) que faz o read de todas as animacoes associadas ao nodeTag
  *	@param nodeTag tag do node ao qual se pretende ler as transformações
  */
LSXreader.prototype.readNodeAnimations = function(nodeID, nodeTag) {
  var animations = [];

	//gathers all ANIMATIONREF tags inside an array
	var animationRefs = nodeTag.getElementsByTagName('ANIMATIONREF');

	for(var i = 0; i < animationRefs.length; i++){
		var animationID = this.reader.getString(animationRefs[i], 'id', 1);

		if(this.scene.graph.animations[animationID] != null)
			animations.push(animationID);
		else throw "Animation undefined at " + nodeID + ": " + animationID;
	}

	return animations;
}


/**	@brief Função auxiliar que lê argumentos de primitivas
  *	@param tagLine linha onde o tag se encontra
  *	@param tag tag do argumento
  *	@param value bolean se se pretende mostrar o warning ou não
  * @return retorna um array com os valores dos argumentos
  */
LSXreader.prototype.getArgs = function(tagLine, tag, value) {
	if (value == undefined)
		value = true;
	if (tagLine == null) {
		console.error("element is null.");
		return null;
	}
	if (tag == null) {
		console.error("args attribute name is null.");
		return null;
	}
	var d = tagLine.getAttribute(tag);
	if (d == null) {
		if (value) console.error(" is null for attribute " + tag + ".");
		return null;
	}
	var e = d.split(' ');
	var f = new Array();
	for (var g = 0; g < e.length; g++) {
		if(e[g] != "")
			f.push(parseFloat(e[g]));

	}
	return f;
};


/**	@brief Função que faz a verificação de valores inteiros.
  * @param recebe um conjunto de argumentos cariáveis
  * @return retorna true se é um mau valor inteiro e false se não
  */
LSXreader.prototype.isBadInteger=function () {

  	for(var i = 0; i < arguments.length;i++){
  		if(isNaN(arguments[i]) || arguments[i]==null)
  			return true;
  	}

  	return false;
};


/**	@brief Função que verifica se um valor é boleano
  * @param bool recebe um conjunto de argumentos variáveis
  * @return retorna true se é um mau valor boolean e false se não
  */
LSXreader.prototype.isBadBoolean=function (bool) {

	if(bool ==0 || bool ==1)
		return false
	return true;
};


/**	@brief Função que verifica se um conjunto de valores é código RGB
  * @param r valor r
  * @param g valor g
  * @param b valor b
  * @param a valor a
  * @return retorna true se é um mau valor RGB e false se não
  */ 
LSXreader.prototype.isBadRGBA=function (r,g,b,a) {
	if(r<0 || r>1 || isNaN(r)){
		return true;
	}if(g<0 || g>1 || isNaN(g)){
		return true;
	}
	if(b<0 || b>1 || isNaN(b)){
		return true;
	}
	if(a<0 || a>1 || isNaN(a)){
		return true;
	}
	return false;
}; 


/**	@brief Função que envia o erro do parser
  * @param message message of error
  */ 
LSXreader.prototype.onXMLError=function (message) {
	console.error("LSX Loading Error: "+message);	
	this.loadedOk=false;
};