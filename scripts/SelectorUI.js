import * as THREE from '../build/three.module.js';
import { PLYLoader } from '../jsm/loaders/PLYLoader.js';
export class SelectorUI {
	constructor(scene) {
		this.assets = null
		this.collection = {}
		this.isGenerated = false
		this.currentCategory = null
		this.scene = scene
		this.groupUI = new THREE.Group()
		this.enabled = false
	}
	createCollectionItem(mesh, index)
	{
		var itemGroup = new THREE.Group()
		itemGroup.position.x = index*UI_ITEM_OFFSET
		var size_x = mesh.geometry.boundingBox.getSize().x
		var size_z = mesh.geometry.boundingBox.getSize().y
		var sizeBox = Math.max(size_x,size_z)
		var scale = UI_ITEM_SIZE/sizeBox
		mesh.scale.x = scale
		mesh.scale.y = scale
		mesh.scale.z = scale
		mesh.rotation.x += THREE.Math.degToRad(-30)
		mesh.rotation.y += THREE.Math.degToRad(-30)
		mesh.rotation.z += THREE.Math.degToRad(-30)
		itemGroup.add(mesh)
		return itemGroup
	}
	createCollectionGroup(name, index)
	{
		var catGroup = new THREE.Group()
		catGroup.name = name
		catGroup.indexSelected = 0
		catGroup.position.z = index*UI_ITEM_OFFSET
		return catGroup
	}
	generateCollection(assets)
	{
		this.assets = assets
		
		for(var asset in this.assets)
		{
			var added = false;
			var categoryName = this.assets[asset].category
			for(var i=0; i < this.groupUI.children.length; ++i)
			{
				var catGroup = this.groupUI.children[i]
				if(catGroup.name == categoryName)
				{
					var item = this.createCollectionItem(this.assets[asset].getPrototype(),catGroup.children.length)
					catGroup.add(item)
					added = true
					break
				}
			}
			if(!added)
			{
				if(this.currentCategory == null)
					this.currentCategory = this.assets[asset].category
				var item = this.createCollectionItem(this.assets[asset].getPrototype(),0)
				var category = this.createCollectionGroup(this.assets[asset].category,this.groupUI.children.length)
				category.add(item)
				this.groupUI.add(category)
			}
		}
		this.isGenerated = true
		this.showUI()

	}
	isReady()
	{
		return this.isGenerated
	}
	showUI()
	{
		if(!this.isReady() || this.enabled)
			return
		this.scene.add(this.groupUI)
		this.enabled = true
	}
	hideUI()
	{
		if(!this.isReady() || !this.enabled)
			return
		this.scene.remove(this.groupUI)
		this.enabled = false
	}
	updateUI(dt, controllerPosition)
	{
		if(!this.isReady() || !this.enabled)
			return
	}
}