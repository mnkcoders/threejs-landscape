import * as THREE from 'three';
import { TerrainWorld } from './world';
/**
 * 
 */
class Biome {

    /**
     * @param {Number} seed 
     */
    constructor( ) {
        //this._seed = seed;

        this._waterLevel = 0;
        this._water = null;
    }
    /**
     * @param {TerrainWorld} world 
     */
    initialize( world ){
        //create water mesh
        this.flood( world );
        this.populate( world );
    }
    /**
     * 
     * @param {TerrainWorld} world 
     */
    populate(world) {
        if( world instanceof TerrainWorld){

            for (const tile of world.tiles()) {
                const dryness = this.getDryness(tile.position);
                const temperature = this.getTemperature(tile.position);
                // Based on biome rules, optionally place objects
                // Example: place cactus in dry and hot
            }        
        }
    }
    /**
     * @param {TerrainWorld} world 
     * @returns {THREE.Mesh}
     */
    flood( world ){
        if( world instanceof TerrainWorld && world.isFlooded()){

            this._waterLevel = Math.floor(Math.random() * world.maxHeight()) * world.flooding();

            const waterGeometry = new THREE.PlaneGeometry(world.terrainSize(), world.terrainSize(), 10, 10);
            waterGeometry.rotateX(-Math.PI / 2);
            const waterMaterial = new THREE.MeshStandardMaterial({
                //color: 0x1E90FF,
                color: world.isRandom() ? this.createRandomColor() : 0x1E20FF,
                transparent: true,
                //opacity: 0.5
                opacity: Math.floor(Math.random()) * 0.4 + 0.6
            });
            this._water = new THREE.Mesh(waterGeometry, waterMaterial);
            this._water.position.y = this.waterLevel();
            world.scene().add(this._water);
        }        
        return this._water;            
    }
    /**
     * @param {THREE.Vector2} position 
     * @returns {Number}
     */
    getDryness(position) {
      // Could use a noise function or altitude-based logic
      return Math.random(); // Placeholder
    }
    /**
     * @param {Number} position 
     * @returns {Number}
     */
    getTemperature(position) {
      return 1 - Math.abs(position.z) / 100;
    }


    /**
     * @returns {Number}
     */
    waterLevel(){
        return this._waterLevel;
    }
    /**
     * @returns {THREE.Mesh}
     */
    water(){
        return this._water;
    }
    /**
     * @returns {Boolean}
     */
    hasWater(){
        return this.water() !== null;
    }

    /**
     * @param {Number} time 
     */
    update(time){

    }
  }

  
  export {Biome};