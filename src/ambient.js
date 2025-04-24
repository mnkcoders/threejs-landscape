import * as THREE from "three";
import { TerrainWorld } from "./world";

/**
 * 
 */
class Ambient{

    constructor( dirLight , intensity , background ){
        //attributes
        this._lightColor = 0xffffff;
        this._intensity = 1;
        this._background = 0x87ceeb; //new THREE.Color(`hsl(224, 100%, 90%)`) 
        this._fogDensity = 0;

        //scene components
        this._fog = null;
        this._light = null;
    }
    /**
     * @param {TerrainWorld} world 
     */
    initialize( world ){
        if( world instanceof TerrainWorld){
            const seed = world.seed();

            this._lightColor = seed.ambient();
            this._intensity = seed.intensity();
            this._background = seed.background();
            this._fogDensity = seed.fogDensity();
            
            this._light = new THREE.DirectionalLight(this._lightColor, this._intensity );
            this._light.position.set(10, 50, 10);
            world.scene().add(this._light);            

            if( this._fogDensity){
                this._fog = new THREE.FogExp2(this._background, this._fogDensity);
                world.scene().fog = this._fog;    
            }
            world.scene().background = new THREE.Color(this._background);
        }
    }
    /**
     * @returns {THREE.DirectionalLight}
     */
    light(){
        return this._light || null;
    }
    /**
     * @returns {THREE.FogExp2}
     */
    fog(){
        return this._fog || null;
    }
    /**
     * @returns {THREE.Color}
     */
    background(){
        return this._background;
    }
    /**
     * @returns {THREE.Color}
     */
    lightColor(){
        return this._lightColor;
    }
    /**
     * @returns {Number}
     */
    lightIntensity(){
        return this._intensity;
    }
    /**
     * @param {Number} time 
     */
    update( time ){

    }
}

export {Ambient};