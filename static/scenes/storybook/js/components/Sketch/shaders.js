/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fragment = `
uniform vec2 u_resolution;

uniform sampler2D u_texture;
uniform sampler2D u_texture2;
uniform vec2 u_textureFactor;
uniform vec2 u_texture2Factor;
uniform float u_textureProgress;

// RGB
uniform vec2 u_rgbPosition;
uniform vec2 u_rgbVelocity;

varying vec2 vUv;
vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
  return uvs * factor - factor /2. + 0.5;
}
void main(){
	// On THREE 102 The image is has Y backwards
	// vec2 flipedUV = vec2(vUv.x,1.-vUv.y);

	vec2 normalizedRgbPos = u_rgbPosition / u_resolution;
	normalizedRgbPos.y = 1. - normalizedRgbPos.y;

	vec2 vel = u_rgbVelocity;
	float dist = distance(normalizedRgbPos + vel / u_resolution, vUv.xy);

	float ratio = clamp(1.0 - dist * 5., 0., 1.);


	vec4 tex1 = vec4(1.);
	vec4 tex2 = vec4(1.);

	vec2 uv = vUv;

	uv.x -= sin(uv.y) * ratio / 100. * (vel.x + vel.y) / 7.;
	uv.y -= sin(uv.x) * ratio / 100. * (vel.x + vel.y) / 7.;

	tex1.r = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).r;
	tex2.r = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).r;

	uv.x -= sin(uv.y) * ratio / 150. * (vel.x + vel.y) / 7.;
	uv.y -= sin(uv.x) * ratio / 150. * (vel.x + vel.y) / 7.;

	tex1.g = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).g;
	tex2.g = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).g;

	uv.x -= sin(uv.y) * ratio / 300. * (vel.x + vel.y) / 7.;
	uv.y -= sin(uv.x) * ratio / 300. * (vel.x + vel.y) / 7.;

	tex1.b = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor )).b;
	tex2.b = texture2D(u_texture2, centeredAspectRatio(uv, u_textureFactor )).b;

	vec4 fulltex1 = texture2D(u_texture, centeredAspectRatio(vUv, u_textureFactor) );
	vec4 fulltex2 = texture2D(u_texture2, centeredAspectRatio(vUv, u_texture2Factor));

	vec4 mixedTextures =  mix(tex1,tex2,u_textureProgress);

	gl_FragColor = mixedTextures;
}
`;

const vertex = `
#define PI 3.14159265359
uniform float u_offset;
uniform float u_progress;
uniform float u_direction;
uniform float u_time;
uniform float u_waveIntensity;
varying vec2 vUv;
void main(){
	vec3 pos = position.xyz;

	float distance = length(uv.xy - 0.5 );
	float sizeDist = length(vec2(0.5,0.5));
	float normalizedDistance = distance/sizeDist ;

	float stickOutEffect = normalizedDistance ;
	float stickInEffect = -normalizedDistance ;

	float stickEffect = mix(stickOutEffect,stickInEffect, u_direction);

	// Backwards V wave.
	float stick = 0.5;

	float waveIn = u_progress*(1. / stick);
	float waveOut =  -( u_progress - 1.) * (1./(1.-stick) );
	waveOut = pow(smoothstep(0.,1.,waveOut),0.7);

	float stickProgress = min(waveIn, waveOut);


	// We can re-use stick Influcse because this oen starts at the same position
	float offsetInProgress = clamp(waveIn,0.,1.);

	// Invert stickout to get the slope moving upwards to the right
	// and move it left by 1
	float offsetOutProgress = clamp(1.-waveOut,0.,1.);

	float offsetProgress = mix(offsetInProgress,offsetOutProgress,u_direction);


	float stickOffset = u_offset;
	pos.z += stickEffect * stickOffset * stickProgress  - u_offset * offsetProgress;

	pos.z += sin(distance * 8. - u_time * 2. )  * u_waveIntensity;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

	vUv = uv;
}
`;

export {
	fragment,
	vertex
};