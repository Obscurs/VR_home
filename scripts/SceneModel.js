import { PLYLoader } from '../../jsm/loaders/PLYLoader.js';
import { MeshNormalMaterial,TextureLoader, MeshBasicMaterial,MeshPhongMaterial, VertexColors, Mesh, Matrix4, Math, CubeTextureLoader } from '../../build/three.module.js';

export class SceneModel {
	constructor(basePath, scene) {
		this.loaded = false
		this.textureLoaded = false
		this.instanciated = false
		this.basePath = basePath
		this.scene = scene
		this.cubemapLoaded = false
	}
	loadPLY(path)
	{
		const loader = new PLYLoader();
		var self = this
		loader.load( path, function ( geometry ) {
			//const material = new MeshBasicMaterial( { color: 0xffffff} );
			var texture = new TextureLoader().load(self.basePath+self.textureName, function(tex){self.textureLoaded = true});
			//var material = new MeshNormalMaterial({ map: texture, flatShading: true });
			const material = new MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 200, map: texture} );
			self.mesh = new Mesh( geometry, material );
			self.mesh.name = SCENE_MODEL_NAME
			self.mesh.destroyable = false
			var m2 = new Matrix4();
			m2.makeRotationX(Math.degToRad(-90))

			self.mesh.applyMatrix4(m2);

			self.instanciated = true

			console.log("PLY LOADED")

		})
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
		this.loadPLY(this.basePath+this.path)
		this.loaded = true
		this.textureName = jsonData.texture
		this.cubemapName = jsonData.cubemap
		this.loadCubemap(this.basePath+this.cubemapName+"/")

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