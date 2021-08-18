import { PLYLoader } from '../../jsm/loaders/PLYLoader.js';
import { getDescriptorFromInstance, exportJSON} from './utils.js';
import { MeshNormalMaterial,TextureLoader,PointLight, MeshBasicMaterial,MeshPhongMaterial, VertexColors, Mesh, Matrix4, Math, CubeTextureLoader } from '../../build/three.module.js';

export class SceneModel {
	constructor(basePath, scene) {
		this.loaded = false
		this.textureLoaded = false
		this.instanciated = false
		this.basePath = basePath
		this.scene = scene
		this.cubemapLoaded = false
		this.lights = null
	}
	loadPLY(path)
	{
		const loader = new PLYLoader();
		var self = this
		loader.load( path, function ( geometry ) {
			//const material = new MeshBasicMaterial( { color: 0xffffff} );
			var texture = new TextureLoader().load(self.basePath+self.textureName, function(tex){self.textureLoaded = true});
			//var material = new MeshNormalMaterial({ map: texture, flatShading: true });
			const material = new MeshPhongMaterial( { color: 0xffffff, flatShading: true, specular: 0x111111, shininess: 200, map: texture} );
			self.mesh = new Mesh( geometry, material );
			self.mesh.name = SCENE_MODEL_NAME
			self.mesh.destroyable = false
			var m2 = new Matrix4();
			m2.makeRotationX(Math.degToRad(-90))

			self.mesh.applyMatrix4(m2);
			self.mesh.castShadow = true;
			self.mesh.receiveShadow = true;

			self.instanciated = true

			console.log("PLY LOADED")

		})
	}
	loadLights(scene)
	{
		for(var i=0; i < this.lights.length; ++i)
		{
			var lightDesc = this.lights[i]
			var intvalcol = parseInt(lightDesc.color, 16)
			const light = new PointLight( intvalcol,1, lightDesc.distance, lightDesc.decay );
			light.position.set( lightDesc.pos_x, lightDesc.pos_y, lightDesc.pos_z );
			scene.add( light );
		}
	}
	loadCubemap(path)
	{
		var self = this
		this.scene.background = new CubeTextureLoader()
		.setPath( path )
		.load( [
			'px.png',
			'nx.png',
			'py.png',
			'ny.png',
			'pz.png',
			'nz.png'
		], function(tex){self.cubemapLoaded = true });
	}
	loadFromJSON(jsonData)
	{
		console.log("INFO: Loading SceneModel from JSON...")
		this.path = jsonData.path
		this.assets = jsonData.assets
		this.lights = jsonData.lights
		this.loadPLY(this.basePath+this.path)
		this.loaded = true
		this.textureName = jsonData.texture
		this.cubemapName = jsonData.cubemap
		this.loadCubemap(this.basePath+this.cubemapName+"/")

	}
	exportToJSON(currentInstances)
	{

		var data = {
			path: this.path,
			texture: this.textureName,
			scale: 1,
			cubemap: this.cubemapName,
			assets: [],
			lights: this.lights
		}
		for(var i = 0; i < currentInstances.length;  ++i)
		{
			var desc = getDescriptorFromInstance(currentInstances[i])
			data.assets.push(desc)
		}
		exportJSON(JSON.stringify(data))
	}
	isLoaded()
	{
		return this.loaded && this.instanciated && this.textureLoaded && this.cubemapLoaded
	}
	getMesh()
	{
		return this.mesh
	}

	getAssets()
	{
		return this.assets
	}
	getNameAsset(index)
	{
		return this.assets[index].name
	}
}