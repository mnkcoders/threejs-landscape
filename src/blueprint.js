import FastNoiseLite from "fastnoise-lite";
import { Color } from "three";

/**
 * @class {WorldSeed}
 */
class WorldSeed {
    constructor(baseSeed = 0, randomize = false) {

        this._randomize = randomize;
        this._baseSeed = baseSeed || Math.floor(Math.random() * 99999999);
        this._flooding = 0;
        this._worldHeight = 40;
        this._intensity = 0;
        this._noiseScale = (Math.floor(Math.random() * 40) / 100) + 0.7;
        //this._noiseScale = 1;
        //this._blueprint = new Blueprint();

        this.setupNoise();
    }
    /**
     * @returns {Blueprint}
     */
    bp() {
        return this._blueprint;
    }
    /**
     * @returns {Boolean}
     */
    isRandom() {
        return this._randomize;
    }
    /**
     * @returns {FastNoiseLite}
     */
    setupNoise() {
        this._noise = new FastNoiseLite(this.seed());
        this._noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
        return this._noise;
    }
    /**
     * @param {Number} x
     * @param {Number} z
     * @returns {FastNoiseLite}
     */
    getNoise(x, z) {
        return this._noise.GetNoise(x, z);
    }
    /**
     * @returns {Number}
     */
    seed() {
        return this._baseSeed;
    }
    /**
     * @returns {Boolean}
     */
    flooded() {
        return this.flooding() > 0;
        //return Blueprint.biomes().includes(this.biome());
    }
    /**
     * @returns {Number}
     */
    flooding() {
        if (this._flooding === 0) {
            this._flooding = this.hash(this.seed() + 13) % 0.2 + 0.1; // Between 0.1 and 0.3
        }
        return this._flooding;
    }
    /**
     * 
     * @returns {String}
     */
    ambient() {
        if (!this.hasOwnProperty('_ambientColor')) {
            this._ambientColor = this.pickFromSeed(this.seed() + 27, Blueprint.ambients());
        }
        return this._ambientColor;
    }
    /**
     * @returns {Number}
     */
    intensity() {
        if (this._intensity === 0) {
            this._intensity = this.isRandom() ? Math.floor(Math.random() * 5) + 5 : 12;
        }
        return this._intensity;
    }
    /**
     * @returns {Color}
     */
    background() {
        if (!this.hasOwnProperty('_backgroundColor')) {
            this._backgroundColor = this.isRandom() ?
                this.createRandomColor() :
                0x87ceeb;
                //new THREE.Color(`hsl(224, 100%, 90%)`);
        }
        return this._backgroundColor;
    }
    /**
     * @returns {Number}
     */
    fogDensity(){
        return 0.0025;
    }
    /**
     * @returns {String}
     */
    water() {
        if (!this.hasOwnProperty('_waterColor')) {
            this._waterColor = this.pickFromSeed(this.seed() + 41, Blueprint.waterTypes());
        }
        return this._waterColor;
    }
    /**
     * @returns {String}
     */
    biome() {
        if (!this.hasOwnProperty('_biomeTemplate')) {
            this._biomeTemplate = this.pickFromSeed(this.seed() + 69, Blueprint.biomes());
        }
        return this._biomeTemplate;
    }
    /**
     * @returns {Number}
     */
    worldHeight() {
        if (this._worldHeight === 0) {
            this._worldHeight = Math.floor(Math.random() * 40) + 10;
        }
        return this._worldHeight;
    }
    /**
     * @returns {Number}
     */
    worldScale(){
        return this._noiseScale;
    }
    // --- Internal Helpers ---
    /**
     * @param {Number} seed 
     * @returns {Number}
     */
    hash(seed) {
        // Simple LCG
        let s = seed;
        s = (s ^ 61) ^ (s >>> 16);
        s = s + (s << 3);
        s = s ^ (s >>> 4);
        s = s * 0x27d4eb2d;
        s = s ^ (s >>> 15);
        return Math.abs(s / 0x7fffffff);
    }
    /**
     * 
     * @param {Number} seed 
     * @param {Array} list 
     * @returns []
     */
    pickFromSeed(seed = 1, list = []) {
        const index = Math.floor(this.hash(seed) * list.length);
        return list[index];
    }
}
/**
 * @class {Blueprint}
 */
class Blueprint {
    constructor(name, biome = '') {
        this._name = name;
        this._biome = biome || Blueprint.randomBiome();
        this._ambientColors = [];
        this._fogColors = [];
        this._lightColors = [];
        this._intensity = [];
        this._waterTypes = [];
        this._textures = [];
        this._skyBoxes = [];
        this._flooding = 0;
        this._worldHeight = [20, 40, 60, 80];
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * @returns {String}
     */
    biome() {
        return this._biome;
    }




    /**
     * @returns {String[]}
     */
    static biomes() {
        return ['forest', 'desert', 'beach', 'mountain', 'swamp'];
    }
    /**
     * @returns {String[]}
     */
    static waterTypes() {
        return ['#223344', '#4a758e', '#2f3f4f', '#1a5e6e'];
    }
    /**
     * @returns {String[]}
     */
    static ambients() {
        return ['#ffffff', '#e0ddff', '#c9eaf3', '#fffae1'];
    }
    /**
     * @returns {String}
     */
    static randomBiome() {
        const biomes = Blueprint.biomes();
        return biomes[Math.floor(Math.random() * biomes.length)]
    }
    /**
     * @returns {THREE.Color}
     */
    static createRandomColor() {
        const hue = Math.floor(Math.random() * 360); // Random hue between 0-360
        return new THREE.Color(`hsl(${hue}, 80%, 70%)`); // Soft sky tones
    }
}

export { WorldSeed };