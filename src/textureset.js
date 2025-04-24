import * as THREE from 'three';
import { TerrainWorld } from './world';

/**
 * 
 */
class TextureSet {
    constructor(loader = new THREE.TextureLoader()) {
      this.loader = loader;
      this.textures = {};
    }
    /**
     * @param {TerrainWorld} world 
     */
    initialize( world ){
      if( world instanceof TerrainWorld){
        //implement
      }
    }
  
    // Load and assign textures to a type (e.g., "grass", "rock")
    add(type, urls) {
      this.textures[type] = urls.map(url => {
        const tex = this.loader.load(url);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(32, 32);
        return tex;
      });
    }
  
    // Select texture based on position hash or terrain ID
    get(type, position = { x: 0, y: 0 }) {
      const list = this.textures[type];
      if (!list || list.length === 0) return null;
      const index = Math.abs(Math.floor(Math.sin(position.x * 12.9898 + position.y * 78.233) * 43758.5453)) % list.length;
      return list[index];
    }
  
    // Returns a ShaderMaterial with blended textures
    buildMaterial(params = {}) {
      const {
        waterLevel = 10.0,
        maxHeight = 100.0
      } = params;
  
      const uniforms = {
        textures: {
          value: {
            grass: this.get("grass"),
            rock: this.get("rock"),
            sand: this.get("sand"),
            snow: this.get("snow"),
            underwater: this.get("underwater")
          }
        },
        waterLevel: { value: waterLevel },
        terrainMaxHeight: { value: maxHeight }
      };
  
      return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: this.getVertexShader(),
        fragmentShader: this.getFragmentShader(),
        lights: false,
        transparent: false
      });
    }
  
    // Vertex Shader
    getVertexShader() {
      return `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
  
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
    }
  
    // Fragment Shader with blending logic
    getFragmentShader() {
      return `
        precision mediump float;
  
        uniform sampler2D textures_grass;
        uniform sampler2D textures_rock;
        uniform sampler2D textures_sand;
        uniform sampler2D textures_snow;
        uniform sampler2D textures_underwater;
  
        uniform float waterLevel;
        uniform float terrainMaxHeight;
  
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
  
        float getSlope(vec3 normal) {
          return 1.0 - abs(normal.y);
        }
  
        void main() {
          float slope = getSlope(normalize(vNormal));
          float height = vPosition.y;
  
          // Blend weights
          float rockWeight = smoothstep(0.3, 0.6, slope);
          float underwaterWeight = smoothstep(waterLevel - 5.0, waterLevel - 2.0, height);
          float sandWeight = smoothstep(waterLevel, waterLevel + 3.0, height) * (1.0 - rockWeight);
          float grassWeight = smoothstep(waterLevel + 3.0, terrainMaxHeight * 0.85, height) * (1.0 - rockWeight);
          float snowWeight = smoothstep(terrainMaxHeight * 0.85, terrainMaxHeight, height);
  
          float total = rockWeight + underwaterWeight + sandWeight + grassWeight + snowWeight;
          rockWeight /= total;
          underwaterWeight /= total;
          sandWeight /= total;
          grassWeight /= total;
          snowWeight /= total;
  
          // Sample and blend
          vec4 rockTex = texture2D(textures_rock, vUv);
          vec4 underwaterTex = texture2D(textures_underwater, vUv);
          vec4 sandTex = texture2D(textures_sand, vUv);
          vec4 grassTex = texture2D(textures_grass, vUv);
          vec4 snowTex = texture2D(textures_snow, vUv);
  
          vec4 finalColor =
              rockTex * rockWeight +
              underwaterTex * underwaterWeight +
              sandTex * sandWeight +
              grassTex * grassWeight +
              snowTex * snowWeight;
  
          gl_FragColor = finalColor;
        }
      `;
    }
  }
  

  export {TextureSet};