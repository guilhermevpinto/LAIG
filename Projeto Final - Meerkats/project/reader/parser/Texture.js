function Texture(scene, path, id, amp) {
    CGFtexture.call(this, scene, path);
    this.id = id;
    this.amplifyFactor={ampS: amp[0],
    					ampT: amp[1]
    };
};

Texture.prototype = Object.create(CGFtexture.prototype);
Texture.prototype.constructor = Texture;