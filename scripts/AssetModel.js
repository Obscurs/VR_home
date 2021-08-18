import { PLYLoader } from '../../jsm/loaders/PLYLoader.js';
import { MeshBasicMaterial,MeshPhongMaterial, VertexColors, Mesh, Matrix4, Math, Group, Box3, Vector3} from '../../build/three.module.js';

export class AssetModel {
	constructor(basePath) {
		this.loaded = false
		this.basePath = basePath
		this.instancedPrototipe = false
		this.prototypeInstance = new Group()
		this.category = "none"
	}
	loadPrototipe(path)
	{
		const loader = new PLYLoader();
		var self = this
		loader.load( path, function ( geometry ) {
			//const material = new MeshBasicMaterial( { color: 0xffffff} );
			const material = new MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 200, vertexColors: VertexColors} );
			var mesh = new Mesh( geometry, material );
			mesh.name = self.name

			self.prototypeInstance.add(mesh)

			self.prototypeInstance.name = self.name
			//self.prototypeInstance.geometry.computeBoundingBox();
			var m2 = new Matrix4();
			m2.makeRotationX(Math.degToRad(-90))

			self.prototypeInstance.applyMatrix4(m2);
				
			self.prototypeInstance.rotation.x += Math.degToRad(-30)
			self.prototypeInstance.rotation.y += Math.degToRad(-30)
			self.prototypeInstance.rotation.z += Math.degToRad(-30)

			const aabb = new Box3();
			aabb.setFromObject(self.prototypeInstance);
			self.prototypeInstance.boundingBox = aabb

			console.log("PROTOTYPE "+self.prototypeInstance.name+" LOADED")

			self.instancedPrototipe = true

		})
	}
	loadPLY(path, params, instances, scene)
	{
		const loader = new PLYLoader();
		var self = this
		loader.load( path, function ( geometry ) {
			//const material = new MeshBasicMaterial( { color: 0xffffff} );
			const material = new MeshPhongMaterial( { color: 0xffffff, flatShading: true, specular: 0x111111, shininess: 200, vertexColors: VertexColors} );
			var group = new Group()
			group.name = self.name
			var mesh = new Mesh( geometry, material );
			mesh.name = self.name
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			//mesh.geometry.computeBoundingBox();
			group.add(mesh)

			const aabb = new Box3();
			aabb.setFromObject(group);
			group.boundingBox = aabb

			var m2 = new Matrix4();
			m2.makeRotationX(Math.degToRad(-90))

			group.applyMatrix4(m2);

			group.destroyable = true
			group.scale.x = params.scale
			group.scale.y = params.scale
			group.scale.z = params.scale

			group.rotation.x += Math.degToRad(params.rot_x)
			group.rotation.y += Math.degToRad(params.rot_z)
			group.rotation.z += Math.degToRad(params.rot_y)

			group.position.x = params.pos_x
			group.position.y = params.pos_y
			group.position.z = params.pos_z

			
			
			console.log("PLY LOADED")
			instances.push(group)
			if(scene != null)
				scene.add(group)
		})
	}
	
	loadFromJSON(jsonData)
	{
		console.log("INFO: Loading Asset from JSON...")
		this.path = jsonData.path
		this.name = jsonData.name
		this.category = jsonData.type
		this.loadPrototipe(this.basePath+this.path)
		this.loaded = true
		
	}
	isLoaded()
	{
		return this.loaded && this.instancedPrototipe
	}

	instanciate(params, instances, scene)
	{
		this.loadPLY(this.basePath+this.path, params, instances, scene)
	}
	getName()
	{
		return this.name
	}
	getPrototype()
	{
		return this.prototypeInstance
	}
}