import { WorldSeed } from "./blueprint";
import { TextureSet } from "./textureset";
import { Biome } from "./biome";
import { Ambient } from "./ambient";
import * as THREE from 'three';

/**
 * 
 */
class TerrainWorld {
    /**
     * @param {Number} tileSize Size/Scale of the Tile
     * @param {Number} gridSize Tile Mesh Surface Divisions (KEEP IT LOW!!!)
     */
    constructor(tileSize = 16, gridSize = 8) {

        this._seed = new WorldSeed( 0 , false);

        this._corruption = 1;

        // Size of the looping terrain
        this._tileSize = tileSize;
        this._gridSize = gridSize;
        //this._worldSize = size;
        //this._maxHeight = Math.floor(Math.random() * 40) + 10;
        //this._maxHeight = maxHeight || Math.floor(Math.random() * 40) + 10;
        this._maxHeight = this.seed().worldHeight();
        this._noiseScale = this.seed().worldScale();

        this._wireframe = false;

        this.initialize();
        this.create();
    }
    /**
     * @returns {WorldSeed}
     */
    seed() {
        return this._seed;
    }    
    /**
     * @returns {Boolean}
     */
    isRandom(){
        return this.seed().isRandom();
    }
    /**
     * 
     */
    initialize() {

        this._scene = new THREE.Scene();

        this._textureSet = new TextureSet();
        this._biome = new Biome( );
        this._ambient = new Ambient(
            0xffffff,
            this.isRandom() ? Math.floor(Math.random() * 5) + 5 : 12,
            this.isRandom() ? this.createRandomColor() : new THREE.Color(`hsl(224, 100%, 90%)`),
        );
    }
    /**
     * 
     */
    create() {
        console.log(this);

        this.createTerrain();
        //initialize textures
        this.textureSet().initialize(this);
        //initialize biome
        this.biome().initialize(this);
        //initialize ambient
        this.ambient().initialize(this);
    }
    /**
     * 
     * @param {Number} x 
     * @param {Number} z 
     * @param {Number} scale 
     * @returns {Number}
     */
    generateHeight(x, z, scale = 10) {

        let height = this.heightMapMask(x,z,scale,8,0.4);
        height = this.biomeMask( height , x , z , 0.3,0.5,0.5 , 0.02);
        height = this.shapingMask( height , 0.25 );
        //height = this.smothingMask( height , 0.2 , 0.4);
        return height;
    }
    /**
     * 
     * @param {Number} x 
     * @param {Number} z 
     * @param {Number} scale 
     * @param {Number} octaves
     * @param {Number} persistence How quickly amplitude drops
     * @returns {Number}
     */    
    heightMapMask( x , z ,scale = 1 , octaves = 4 , persistence = 0.5){
        let total = 0;
        let frequency = 0.4;
        let amplitude = 0.8;
    
        for (let i = 0; i < octaves; i++) {
            total += this.seed().getNoise(x * frequency, z * frequency) * amplitude;
            frequency *= 2;
            amplitude *= persistence;
        }

        return total * scale;
    }
    /**
     * @param {Number} input 
     * @param {Number} x 
     * @param {Number} z 
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} rate 
     * @param {Number} accuracy 
     * @returns {Number}
     */
    biomeMask( input , x,z , min = 0.3 , max = 0.5 , rate = 0.5 , accuracy = 0.01 ){
        const mask = this.seed().getNoise(x * accuracy, z * accuracy);
          // flatten terrain to be more plain-like
        return (mask > min && mask < max) ? input * rate : input;
    }
    /**
     * @param {Number} input 
     * @returns {Number}
     */
    shapingMask(input , thresold = 0.3){
        return (input < thresold) ? input * 0.5 : input;
    }
    /**
     * @param {Number} x 
     * @param {Number} edge0 
     * @param {Number} edge1 
     * @returns {Number} 
     */
    smothingMask(x , edge0 = 0.0, edge1 = 0.3) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }
    
    /**
     * @param {Number} x 
     * @param {Number} z 
     * @param {THREE.Color} tileColor 
     * @returns {THREE.Mesh}
     */
    createTile(x, z, tileColor) {
        const geometry = this.createGeometry(x,z);

        const material = new THREE.MeshStandardMaterial({
            //color: 0x228B22,
            color: tileColor,
            wireframe: this._wireframe
        });
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(x, 0, z);
        this.scene().add(tile);
        return tile;
    }
    /**
     * @param {Number} x 
     * @param {Number} z 
     * @returns {THREE.PlaneGeometry}
     */
    createGeometry(x, z) {
        // You’d plug in noise here based on this.seed
        const geometry = new THREE.PlaneGeometry(this.tileSize(), this.tileSize(), this.gridSize(), this.gridSize());
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position.array;
        const scale = this.noiseScale();
        for (let i = 0; i < positions.length; i += 3) {
            const height = this.generateHeight(
                (positions[i] + x) * scale,
                (positions[i + 2] + z) * scale,
                this.maxHeight()
            );
            positions[i + 1] = height;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * @returns {THREE.Mesh[]}
     */
    createTerrain() {
        this._tiles = [];
        const gridSize = this.gridSize();
        const tileSize = this.tileSize();
        const color = this.isRandom() ? this.createRandomColor() : 0x428B22;
        for (let i = -gridSize / 2; i < gridSize / 2; i++) {
            for (let j = -gridSize / 2; j < gridSize / 2; j++) {
                this._tiles.push(this.createTile(i * tileSize, j * tileSize, color));
            }
        }
        return this._tiles;
    }
    /**
     * @returns {THREE.Color}
     */
    createRandomColor() {
        const hue = Math.floor(Math.random() * 360); // Random hue between 0-360
        return new THREE.Color(`hsl(${hue}, 80%, 70%)`); // Soft sky tones
    }
    /**
     * @returns {Number}
     */
    gridSize() {
        return this._gridSize;
    }
    /**
     * @returns {Number}
     */
    tileSize() {
        return this._tileSize;
    }
    /**
     * @returns {Number}
     */
    terrainSize() {
        return this.tileSize() * this.gridSize();
    }
    /**
     * @returns {Number}
     */
    noiseScale(){
        return this._noiseScale;
    }
    /**
     * @returns {Number}
     */
    maxHeight() {
        return this._maxHeight;
    }

    /**
     * @returns {THREE.Scene}
     */
    scene() {
        return this._scene;
    }
    /**
     * @returns {THREE.Mesh[]}
     */
    tiles(){
        return this._tiles || [];
    }

    /**
     * @returns {Number}
     */
    flooding() {
        return 0;
        this.seed().flooding();
    }
    /**
     * @returns {Boolean}
     */
    isFlooded(){
        return this.seed().flooded();
    }    

    /**
     * @returns {TextureSet}
     */
    textureSet() {
        return this._textureSet;
    }
    /**
     * @returns {Biome}
     */
    biome() {
        return this._biome;
    }
    /**
     * @returns {Ambient}
     */
    ambient() {
        return this._ambient;
    }
    /**
     * @returns {Number}
     */
    corruption( percent = false ){
        return percent ? this._corruption * 100 : this._corruption;
    }
    /**
     * @param {Number} time 
     */
    update( time ){
        this.ambient().update(time);
        this.biome().update(time);
    }
}

export { TerrainWorld };