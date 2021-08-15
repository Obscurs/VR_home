import { PLYLoader } from '../../jsm/loaders/PLYLoader.js';
import { MeshBasicMaterial,MeshPhongMaterial, VertexColors, Mesh, Matrix4, Math } from '../../build/three.module.js';

export class AssetModel {
	constructor(basePath) {
		this.loaded = false
		this.basePath = basePath
	}
	loadPLY(path, params, instances)
	{
		const loader = new PLYLoader();
		var self = this
		loader.load( path, function ( geometry ) {
			//const material = new MeshBasicMaterial( { color: 0xffffff} );
			const material = new MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 200, vertexColors: VertexColors} );
			var mesh = new Mesh( geometry, material );
			mesh.name = self.name
			mesh.geometry.computeBoundingBox();
			var m2 = new Matrix4();
			m2.makeRotationX(Math.degToRad(-90))

			mesh.applyMatrix4(m2);


			mesh.scale.x = params.scale
			mesh.scale.y = params.scale
			mesh.scale.z = params.scale

			mesh.rotation.x += Math.degToRad(params.rot_x)
			mesh.rotation.y += Math.degToRad(params.rot_z)
			mesh.rotation.z += Math.degToRad(params.rot_y)

			mesh.position.x = params.pos_x
			mesh.position.y = params.pos_y
			mesh.position.z = params.pos_z
			console.log("PLY LOADED")
			instances.push(mesh)
		})
	}
	loadFromJSON(jsonData)
	{
		console.log("INFO: Loading Asset from JSON...")
		this.path = jsonData.path
		this.name = jsonData.name
		this.loaded = true
		
	}
	isLoaded()
	{
		return this.loaded
	}

	instanciate(params, instances)
	{
		this.loadPLY(this.basePath+this.path, params, instances)
	}
	getName()
	{
		return this.name
	}
}