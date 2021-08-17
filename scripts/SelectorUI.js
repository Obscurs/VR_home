import * as THREE from '../build/three.module.js';
import { PLYLoader } from '../jsm/loaders/PLYLoader.js';
const SelectorStates =
{
	IDLE: "idle_state",
	GOING_UP: "up_state",
	GOING_DOWN: "down_state",
	GOING_LEFT: "left_state",
	GOING_RIGHT: "right_state",
}
const UI_ITEM_SIZE = 0.15
const UI_ITEM_OFFSET = 0.06

export class SelectorUI {
	constructor(scene) {
		this.assets = null
		this.isGenerated = false
		this.currentCategory = null
		this.currentCategoryIndex = 0
		this.scene = scene
		this.groupUI = new THREE.Group()
		this.enabled = false
		this.state = SelectorStates.IDLE
		this.animSpeed =1
		this.animNormalized =0 //0 means not started anim, 1 means anim done

		this.auxUpPos = null
		this.auxDownPos = null
		this.auxLeftPos = null
		this.auxRightPos = null
		this.auxSelPos = null
	}
	setItemScale(item, scale)
	{
		item.scale.x = item.baseScale*scale
		item.scale.y = item.baseScale*scale
		item.scale.z = item.baseScale*scale
	}
	createCollectionItem(mesh, index)
	{
		var itemGroup = new THREE.Group()
		itemGroup.add(mesh)

		const aabb = new THREE.Box3();
		aabb.setFromObject(itemGroup);
		var size_x = aabb.getSize().x
		var size_z = aabb.getSize().y
		var sizeBox = Math.max(size_x,size_z)
		var s = UI_ITEM_SIZE/sizeBox
		itemGroup.scale.x = s
		itemGroup.scale.y = s
		itemGroup.scale.z = s
		itemGroup.baseScale = s
		

		itemGroup.position.x = index*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
		itemGroup.originalX = itemGroup.position.x
		
		return itemGroup
	}
	createCollectionGroup(name, index)
	{
		var catGroup = new THREE.Group()
		catGroup.name = name
		catGroup.indexSelected = 0

		catGroup.position.y = -index*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
		catGroup.position.z = -UI_ITEM_SIZE*2
		catGroup.originalY = catGroup.position.y
		catGroup.scale.x = 0.5
		catGroup.scale.y = 0.5
		catGroup.scale.z = 0.5
		catGroup.baseScale = 0.5
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
				/*if(this.currentCategory == null)
					this.currentCategory = this.assets[asset].category*/
				var item = this.createCollectionItem(this.assets[asset].getPrototype(),0)
				this.setItemScale(item,2)
				var category = this.createCollectionGroup(this.assets[asset].category,this.groupUI.children.length)
				category.add(item)
				this.groupUI.add(category)
			}
		}
		//var select = this.getSelectedItem()
		this.setItemScale(this.groupUI.children[this.currentCategoryIndex], 2)
		this.isGenerated = true
		//this.showUI(null, null)

	}
	isReady()
	{
		return this.isGenerated
	}
	showUI(pos, dir)
	{
		if(!this.isReady() || this.enabled)
			return
		if(pos != null && dir != null)
		{
			var auxVec = new THREE.Vector3()
			auxVec.copy(pos);
			auxVec.add(dir)
			this.groupUI.position.copy(pos)
			this.groupUI.lookAt(auxVec)
		}
		this.scene.add(this.groupUI)
		this.enabled = true
	}
	hideUI()
	{
		if(!this.isReady() || !this.enabled)
			return
		this.roundState()
		this.scene.remove(this.groupUI)
		this.enabled = false
	}
	getSelectedItem()
	{
		var groupSelected = this.groupUI.children[this.currentCategoryIndex]
		return groupSelected.children[groupSelected.indexSelected]
	}
	updateState(controllerPosition)
	{

		var treshold = 2;
		var groupSelected = this.groupUI.children[this.currentCategoryIndex]
		
		if(this.state==SelectorStates.IDLE)
		{
			var itemSelectPos = new THREE.Vector3();
			groupSelected.children[groupSelected.indexSelected].getWorldPosition( itemSelectPos );
			this.auxSelPos = new THREE.Vector3();
			this.auxSelPos.copy(itemSelectPos)
			this.auxUpPos = null
			this.auxDownPos = null
			this.auxLeftPos = null
			this.auxRightPos = null
			if(this.currentCategoryIndex > 0)
			{
				var groupUp = this.groupUI.children[this.currentCategoryIndex-1]
				this.auxUpPos = new THREE.Vector3();
				var aux = new THREE.Vector3();
				groupUp.children[groupUp.indexSelected].getWorldPosition( aux );
				this.auxUpPos.copy(aux)
			}
			if(this.currentCategoryIndex < this.groupUI.children.length -1)
			{
				var groupDown = this.groupUI.children[this.currentCategoryIndex+1]
				this.auxDownPos = new THREE.Vector3();
				var aux = new THREE.Vector3();
				groupDown.children[groupDown.indexSelected].getWorldPosition( aux );
				this.auxDownPos.copy(aux)
			}
			if(groupSelected.indexSelected > 0)
			{
				this.auxLeftPos = new THREE.Vector3();
				var aux = new THREE.Vector3();
				groupSelected.children[groupSelected.indexSelected-1].getWorldPosition( aux );
				this.auxLeftPos.copy(aux)
			}
			if(groupSelected.indexSelected < groupSelected.children.length -1)
			{
				this.auxRightPos = new THREE.Vector3();
				var aux = new THREE.Vector3();
				groupSelected.children[groupSelected.indexSelected+1].getWorldPosition( aux );
				this.auxRightPos.copy(aux)
			}
		}
		


		
		var distanceCatUp = -1
		var distanceCatDown = -1
		var distanceItemLeft = -1
		var distanceItemRight = -1
		var distanceItemSelected = this.auxSelPos.distanceTo(controllerPosition)

		if(this.auxUpPos !=null)
		{
			distanceCatUp = this.auxUpPos.distanceTo(controllerPosition)
		}
		if(this.auxDownPos !=null)
		{
			distanceCatDown = this.auxDownPos.distanceTo(controllerPosition)
		}
		if(this.auxLeftPos !=null)
		{
			distanceItemLeft = this.auxLeftPos.distanceTo(controllerPosition)
		}
		if(this.auxRightPos !=null)
		{
			distanceItemRight = this.auxRightPos.distanceTo(controllerPosition)
		}
		
		
		if(distanceItemSelected > (UI_ITEM_SIZE+UI_ITEM_OFFSET)*5)
		{
			if(this.state==SelectorStates.IDLE)
				this.hideUI()
		}
		//console.log("SEL: "+Math.round( distanceItemSelected * 10 ) / 10+" UP: "+Math.round( distanceCatUp * 10 ) / 10+" DOWN: "+Math.round( distanceCatDown * 10 ) / 10+" LEFT: "+Math.round( distanceItemLeft * 10 ) / 10+" RIGHT: "+Math.round( distanceItemRight * 10 ) / 10)
		if(distanceItemLeft != -1 && distanceItemLeft < distanceItemSelected)
		{
			//go left
			//console.log("should go left")
			this.animSpeed = Math.min(1+((distanceItemSelected - distanceItemLeft) / (UI_ITEM_SIZE+UI_ITEM_OFFSET))*4,5)
			if(this.state==SelectorStates.IDLE)
				this.state = SelectorStates.GOING_LEFT
		}
		else if(distanceItemRight != -1 && distanceItemRight < distanceItemSelected)
		{
			//go right
			//console.log("should go right")
			this.animSpeed = Math.min(1+((distanceItemSelected - distanceItemRight) / (UI_ITEM_SIZE+UI_ITEM_OFFSET))*4,5)
			if(this.state==SelectorStates.IDLE)
				this.state = SelectorStates.GOING_RIGHT
		}
		else if(distanceCatUp != -1 && distanceCatUp < distanceItemSelected)
		{
			//go up
			//console.log("should go up")
			this.animSpeed = Math.min(1+((distanceItemSelected - distanceCatUp) / (UI_ITEM_SIZE+UI_ITEM_OFFSET))*4,5)
			if(this.state==SelectorStates.IDLE)
				this.state = SelectorStates.GOING_UP
		}
		else if(distanceCatDown != -1 && distanceCatDown < distanceItemSelected)
		{
			//go down
			//console.log("should go down")
			this.animSpeed = Math.min(1+((distanceItemSelected - distanceCatDown) / (UI_ITEM_SIZE+UI_ITEM_OFFSET))*4,5)
			if(this.state==SelectorStates.IDLE)
				this.state = SelectorStates.GOING_DOWN
		}
		else
		{
			//console.log("should stay")
		}
		
	}

	updateAnimation(dt)
	{
		if(this.state == SelectorStates.IDLE)
			return
		this.animNormalized +=dt*this.animSpeed
		if(this.animNormalized > 1)
		{
			this.animNormalized = 1
		}
		if(this.state == SelectorStates.GOING_UP)
		{
			for(var i=0; i <this.groupUI.children.length; ++i)
			{
				var group = this.groupUI.children[i]
				group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)-(UI_ITEM_OFFSET+UI_ITEM_SIZE)*this.animNormalized
			}
			this.setItemScale(this.groupUI.children[this.currentCategoryIndex],2-this.animNormalized)
			this.setItemScale(this.groupUI.children[this.currentCategoryIndex-1],1+this.animNormalized)
			if(this.animNormalized >= 1)
			{
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],1)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex-1],2)
				this.animNormalized = 0
				this.currentCategoryIndex -=1
				this.state = SelectorStates.IDLE
			}

		} else if(this.state == SelectorStates.GOING_DOWN)
		{
			for(var i=0; i <this.groupUI.children.length; ++i)
			{
				var group = this.groupUI.children[i]
				group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)+(UI_ITEM_OFFSET+UI_ITEM_SIZE)*this.animNormalized
			}
			this.setItemScale(this.groupUI.children[this.currentCategoryIndex],2-this.animNormalized)
			this.setItemScale(this.groupUI.children[this.currentCategoryIndex+1],1+this.animNormalized)
			if(this.animNormalized >= 1)
			{
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],1)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex+1],2)
				this.animNormalized = 0
				this.currentCategoryIndex +=1
				this.state = SelectorStates.IDLE
			}
		}else if(this.state == SelectorStates.GOING_LEFT)
		{
			var groupSelected = this.groupUI.children[this.currentCategoryIndex]
			for(var i=0; i <groupSelected.children.length; ++i)
			{
				var aux = i-groupSelected.indexSelected
				var group = groupSelected.children[i]
				group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)+(UI_ITEM_OFFSET+UI_ITEM_SIZE)*this.animNormalized
			}
			this.setItemScale(groupSelected.children[groupSelected.indexSelected],2-this.animNormalized)
			this.setItemScale(groupSelected.children[groupSelected.indexSelected-1],1+this.animNormalized)
			if(this.animNormalized >= 1)
			{
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],1)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected-1],2)
				this.animNormalized = 0
				groupSelected.indexSelected -=1
				this.state = SelectorStates.IDLE
			}
		}else if(this.state == SelectorStates.GOING_RIGHT)
		{
			var groupSelected = this.groupUI.children[this.currentCategoryIndex]
			for(var i=0; i <groupSelected.children.length; ++i)
			{
				var aux = i-groupSelected.indexSelected
				var group = groupSelected.children[i]
				group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)-(UI_ITEM_OFFSET+UI_ITEM_SIZE)*this.animNormalized

			}
			this.setItemScale(groupSelected.children[groupSelected.indexSelected],2-this.animNormalized)
			this.setItemScale(groupSelected.children[groupSelected.indexSelected+1],1+this.animNormalized)
			if(this.animNormalized >= 1)
			{
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],1)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected+1],2)
				this.animNormalized = 0
				groupSelected.indexSelected +=1
				this.state = SelectorStates.IDLE

			}
		}
			//this.state = SelectorStates.IDLE
	}
	roundState()
	{
		if(this.state == SelectorStates.GOING_UP)
		{
			if(this.animNormalized > 0.5)
			{
				for(var i=0; i <this.groupUI.children.length; ++i)
				{
					var group = this.groupUI.children[i]
					group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)-(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],1)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex-1],2)
				this.animNormalized = 0
				this.currentCategoryIndex -=1
				this.state = SelectorStates.IDLE
			}
			else
			{
				for(var i=0; i <this.groupUI.children.length; ++i)
				{
					var group = this.groupUI.children[i]
					group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],2)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex-1],1)
				this.animNormalized = 0
				this.state = SelectorStates.IDLE
			}
		}
		else if(this.state == SelectorStates.GOING_DOWN)
		{
			if(this.animNormalized > 0.5)
			{
				for(var i=0; i <this.groupUI.children.length; ++i)
				{
					var group = this.groupUI.children[i]
					group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)+(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],1)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex+1],2)
				this.animNormalized = 0
				this.currentCategoryIndex +=1
				this.state = SelectorStates.IDLE
			}
			else
			{
				for(var i=0; i <this.groupUI.children.length; ++i)
				{
					var group = this.groupUI.children[i]
					group.position.y = (this.currentCategoryIndex-i)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex],2)
				this.setItemScale(this.groupUI.children[this.currentCategoryIndex+1],1)
				this.animNormalized = 0
				this.state = SelectorStates.IDLE

			}
		}
		else if(this.state == SelectorStates.GOING_LEFT)
		{
			if(this.animNormalized > 0.5)
			{
				var groupSelected = this.groupUI.children[this.currentCategoryIndex]
				for(var i=0; i <groupSelected.children.length; ++i)
				{
					var aux = i-groupSelected.indexSelected
					var group = groupSelected.children[i]
					group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)+(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],1)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected-1],2)
				this.animNormalized = 0
				groupSelected.indexSelected -=1
				this.state = SelectorStates.IDLE
			}
			else
			{
				var groupSelected = this.groupUI.children[this.currentCategoryIndex]
				for(var i=0; i <groupSelected.children.length; ++i)
				{
					var aux = i-groupSelected.indexSelected
					var group = groupSelected.children[i]
					group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],2)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected-1],1)
				this.animNormalized = 0
				this.state = SelectorStates.IDLE
			}
		}
		else if(this.state == SelectorStates.GOING_RIGHT)
		{
			if(this.animNormalized > 0.5)
			{
				var groupSelected = this.groupUI.children[this.currentCategoryIndex]
				for(var i=0; i <groupSelected.children.length; ++i)
				{
					var aux = i-groupSelected.indexSelected
					var group = groupSelected.children[i]
					group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)-(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],1)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected+1],2)
				this.animNormalized = 0
				groupSelected.indexSelected +=1
				this.state = SelectorStates.IDLE
			}
			else
			{
				var groupSelected = this.groupUI.children[this.currentCategoryIndex]
				for(var i=0; i <groupSelected.children.length; ++i)
				{
					var aux = i-groupSelected.indexSelected
					var group = groupSelected.children[i]
					group.position.x = (aux)*(UI_ITEM_OFFSET+UI_ITEM_SIZE)
				}
				this.setItemScale(groupSelected.children[groupSelected.indexSelected],2)
				this.setItemScale(groupSelected.children[groupSelected.indexSelected+1],1)
				this.animNormalized = 0
				this.state = SelectorStates.IDLE
			}
		}
	}
	updateUI(dt, controllerPosition)
	{
		if(!this.isReady() || !this.enabled)
			return
		this.updateState(controllerPosition)
		this.updateAnimation(dt)
		


	}
}