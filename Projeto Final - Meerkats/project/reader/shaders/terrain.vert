attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform float normScale;
uniform sampler2D heightmap;

void main() {
	vec4 height = texture2D(heightmap, aTextureCoord);

	if(height.r > 0.0)
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+aVertexNormal*normScale*(height.r)*0.05, 1.0);
	else gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

	vTextureCoord = aTextureCoord;

}

