
import * as THREE from '../build/three.module.js';
import { positionAtT, getFirstIntersection} from './utils.js';
import { XRControllerModelFactory } from '../jsm/webxr/XRControllerModelFactory.js';
import { PLYLoader } from '../jsm/loaders/PLYLoader.js';
const VRStates =
{
	IDLE: "idle_state",
	DRAGGING: "drag_state",
	MOVING: "move_state",
	SHOWING_UI: "ui_state",
	DELETING_ITEM: "deleting_state",
}
const HEIGHT_OFFSET = 1.6
export class VRControls {
	constructor(scene, renderer, camera, selector) {
		this.loaded = false

		this.g = null
		this.tempVec = null
		this.tempVec1 = null
		this.tempVecP = null
		this.tempVecV = null
		this.guidingController = null
		this.guidelight = null
		this.guideline = null
		this.lineGeometryVertices = null
		this.lineSegments = null
		this.guidesprite = null
		this.camera_group = new THREE.Group()

		this.controller1 = null
		this.controller2 = null
		this.controllerGrip1 = null
		this.controllerGrip2 = null
		this.scene = scene
		this.renderer = renderer
		this.camera = camera
		this.selector = selector
		this.camera_group.position.set(0,HEIGHT_OFFSET,0)
		this.camera_group.add(this.camera)
		this.state = VRStates.IDLE
		this.instancePointed = null
		this.instanceDragged = null

		this.pendingAssetInstance = null
		this.leftControllerData = null
		this.rightControllerData = null

		this.colPlane = null

		var self = this

		const loader = new PLYLoader();
		loader.load( '../assets/arrow.ply', function ( geometry ) {
			const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
			self.guidesprite = new THREE.Mesh( geometry, material );
			self.loaded = true;
			console.log(self.guidesprite)
		})




		function  onSelectStart(self, controller)
		{
			if(controller.type == "left")
			{
				onSelectStartLeft(self, controller)
			}
			else if(controller.type == "right")
			{
				onSelectStartRight(self, controller)
			}

		}
		function  onSelectEnd(self, controller)
		{
			if(controller.type == "left")
			{
				onSelectEndLeft(self, controller)
			}
			else if(controller.type == "right")
			{
				onSelectEndRight(self, controller)
			}
		}
		function onSelectStartLeft(self, controller) {

		}
		function onSelectEndLeft(self, controller) {
			
		}
		function onSelectStartRight(self, controller) {
			if(self.state == VRStates.IDLE)
			{
				if(self.instancePointed != null && self.instancePointed.object.name != SCENE_MODEL_NAME)
				{
					self.state = VRStates.DRAGGING
					self.instanceDragged = self.instancePointed 
					self.instancePointed = null
				}
			}
		    
		}

		function onSelectEndRight(self, controller) {

			if(self.state == VRStates.DRAGGING)
			{
				self.instanceDragged = null
				self.state = VRStates.IDLE
			}

		    
		}
		
		var colGeometry = new THREE.PlaneGeometry( 12, 12 );
		var colMaterial = new THREE.MeshBasicMaterial( { color: 0x005E99 } );
		this.colPlane = new THREE.Mesh( colGeometry, colMaterial );
		this.colPlane.geometry.computeBoundingBox();
		this.colPlane.lookAt(new THREE.Vector3(1, 1, 1));


		this.controller1 = this.renderer.xr.getController( 0 );
		this.controller1.addEventListener( 'selectstart', function(){ onSelectStart(self, this);} );
		this.controller1.addEventListener( 'selectend', function(){ onSelectEnd(self, this);} );
		this.controller1.addEventListener( 'connected', function ( event ) {
			this.add( self.buildController( event.data ) );
			this.type = event.data.handedness
		} );
		this.controller1.addEventListener( 'disconnected', function () {
			this.remove( this.children[ 0 ] );

		} );
		this.camera_group.add( this.controller1 );

		this.controller2 = this.renderer.xr.getController( 1 );
		this.controller2.addEventListener( 'selectstart',  function(){ onSelectStart(self, this);} );
		this.controller2.addEventListener( 'selectend',  function(){ onSelectEnd(self, this);} );
		this.controller2.addEventListener( 'connected', function ( event ) {
			this.add( self.buildController( event.data ) );
			this.type = event.data.handedness

		} );
		this.controller2.addEventListener( 'disconnected', function () {
			this.remove( this.children[ 0 ] );

		} );
		this.camera_group.add( this.controller2 );

		const controllerModelFactory = new XRControllerModelFactory();

		this.controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
		this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );
		this.camera_group.add( this.controllerGrip1 );

		this.controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
		this.controllerGrip2.add( controllerModelFactory.createControllerModel( this.controllerGrip2 ) );
		this.camera_group.add( this.controllerGrip2 );
		
		
		//

		this.g = new THREE.Vector3(0,-9.8,0);
		this.tempVec = new THREE.Vector3();
		this.tempVec1 = new THREE.Vector3();
		this.tempVecP = new THREE.Vector3();
		this.tempVecV = new THREE.Vector3();

		// The this.guideline
		this.lineSegments=10;
		const lineGeometry = new THREE.BufferGeometry();
		this.lineGeometryVertices = new Float32Array((this.lineSegments +1) * 3);
		this.lineGeometryVertices.fill(0);
		const lineGeometryColors = new Float32Array((this.lineSegments +1) * 3);
		lineGeometryColors.fill(0.5);
		lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.lineGeometryVertices, 3));
		lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineGeometryColors, 3));
		const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
		this.guideline = new THREE.Line( lineGeometry, lineMaterial );

		// The light at the end of the line
		this.guidelight = new THREE.PointLight(0xffeeaa, 0, 2);

		this.scene.add(this.camera_group);
		//this.scene.add(this.colPlane);
	}
	isLoaded()
	{
		return this.loaded
	}
	updateControllers()
	{
		const session = this.renderer.xr.getSession();
		let i = 0;
		if (session) {
	        for (const source of session.inputSources) {
	        	var handedness;
	            if (source && source.handedness) {
	                handedness = source.handedness; //left or right controllers
	            }
	            if(source.gamepad)
	            {
	            	const controller = this.renderer.xr.getController(i++);
	            	var data = {
		            	buttons: source.gamepad.buttons.map((b) => b.value),
		                axes: source.gamepad.axes.slice(0),
		                controller: controller
		            }
		            if(handedness == "left")
		            	this.leftControllerData = data
		            else if(handedness =="right")
		            	this.rightControllerData = data 
	            }
	            
	           
	            /*if (!source.gamepad || handedness != "right") continue;
	            const controller = this.renderer.xr.getController(i++);

	            var data = {
	                //handedness: handedness,
	                buttons: source.gamepad.buttons.map((b) => b.value),
	                axes: source.gamepad.axes.slice(0)
	            };*/
	        }
	    }
	}
	isInnerTriggerPressed(controllerData)
	{
		return controllerData.buttons[1] == 1
	}
	isStickButtonPressed(controllerData)
	{
		return controllerData.buttons[3] == 1
	}
	isAButtonPressed(controllerData)
	{
		return controllerData.buttons[4] == 1
	}
	isBButtonPressed(controllerData)
	{
		return controllerData.buttons[5] == 1
	}


	updateInstanceDragged(dt)
	{
		if(this.instanceDragged != null &&  this.instancePointed != null)
		{
			this.instanceDragged.object.position.copy(this.instancePointed.point)
			var instance = this.instanceDragged.object

			var auxVec = new THREE.Vector3()
			auxVec.x = this.instancePointed.normal.x
			auxVec.y = this.instancePointed.normal.y
			auxVec.z = this.instancePointed.normal.z
			auxVec.multiplyScalar(0.02)
			var maxCount = 0
			while(this.checkCollisionMeshGroup(this.colPlane,instance) && maxCount < 100)
			{
				
				instance.position.add(auxVec)
				instance.translateOnAxis(auxVec, 0.02);
				maxCount +=1
			}

			if(this.isInnerTriggerPressed(this.rightControllerData))
				instance.rotation.z += dt
			
		}
	}
	checkCollision(mesh1, mesh2)
	{
		mesh1.updateMatrixWorld();
		mesh2.updateMatrixWorld();
		var bounding1 = mesh1.geometry.boundingBox.clone();
		bounding1.applyMatrix4(mesh1.matrixWorld);
		var bounding2 = mesh2.geometry.boundingBox.clone();
		bounding2.applyMatrix4(mesh2.matrixWorld);

		return bounding1.intersectsBox(bounding2)
	}
	checkCollisionMeshGroup(mesh1, group)
	{
		mesh1.updateMatrixWorld();
		group.updateMatrixWorld();
		var bounding1 = mesh1.geometry.boundingBox.clone();
		bounding1.applyMatrix4(mesh1.matrixWorld);
		console.log(group)
		var bounding2 = group.boundingBox.clone();
		bounding2.applyMatrix4(group.matrixWorld);
		bounding2.name = "bboox"
		/*if(this.scene.children[this.scene.children.length-1].name == "bboox")
			this.scene.remove(scene.children[this.scene.children.length-1])
		this.scene.add(bounding2)*/
		console.log(group.boundingBox.max.x)
		return bounding1.intersectsBox(bounding2)
	}

	updatePointedObject(instances, sceneModel)
	{
		if(this.rightControllerData != null)
		{
			var pos = new THREE.Vector3()
			var dir = new THREE.Vector3()
			this.rightControllerData.controller.getWorldPosition(pos);
		    this.rightControllerData.controller.getWorldDirection(dir);
		    if(pos !=null && dir !=null){
		    	dir.multiplyScalar(-1)
			    var exceptions = []
			    var models = [sceneModel.getMesh()]
			    for(var i=0; i < instances.length; i++)
			    {
			    	//TODO do something with these children[0]
			    	models.push(instances[i].children[0])
			    }
			    //TODO do something with these children[0]
			    if(this.instanceDragged !=null)
			    	exceptions.push(this.instanceDragged.object.children[0])
			    this.instancePointed = getFirstIntersection(models,exceptions, pos, dir)
			    if(this.instancePointed != null && this.instancePointed.object.name != "" && this.instancePointed.object.name == this.instancePointed.object.parent.name)
			    	this.instancePointed.object = this.instancePointed.object.parent
			    if(this.instancePointed != null)
			    {
			    	this.colPlane.position.copy(this.instancePointed.point)
				    var auxVec = new THREE.Vector3()
				    auxVec.copy(this.instancePointed.normal)
				    auxVec.add(this.instancePointed.point)
				    this.colPlane.lookAt(auxVec)
			    }
			    
		    }
		}
	}
	startMovingUser(controller)
	{
		this.state = VRStates.MOVING
		this.guidingController = controller;
	    this.guidelight.intensity = 1;
	    controller.add(this.guideline);
	    this.scene.add(this.guidesprite);
	}
	endMovingUser(controller)
	{
		if (this.guidingController === controller) {

	        // first work out vector from feet to cursor

	        // feet position
	        const feetPos = this.renderer.xr.getCamera(this.camera).getWorldPosition(this.tempVec);
	        feetPos.y = 0;

	        // cursor position
	        const p = this.guidingController.getWorldPosition(this.tempVecP);
	        const v = this.guidingController.getWorldDirection(this.tempVecV);
	        v.multiplyScalar(6);
	        var offsety =  0;
	        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;
	        var cursorPos = positionAtT(this.tempVec1,t,p,v,this.g);
	        //cursorPos.y = this.camera_group.position.y+1
	        cursorPos.y = this.getFloorFromPos(cursorPos)
	        // Offset
	        const offset = cursorPos.addScaledVector(feetPos ,-1);

	        // Do the locomotion
	        //locomotion(offset);
	        this.moveVRCam(offset)
	        // clean up
	        this.guidingController = null;
	        this.guidelight.intensity = 0;
	        controller.remove(this.guideline);
	        this.scene.remove(this.guidesprite);

	        this.state = VRStates.IDLE
	    }
	}
	doJoystickEvents()
	{
		if(this.rightControllerData.axes[3] < -0.5 && this.state == VRStates.IDLE)
		{
			this.startMovingUser(this.rightControllerData.controller)
			
		} else if(this.rightControllerData.axes[3] > -0.2 && this.state == VRStates.MOVING)
		{
			this.endMovingUser(this.rightControllerData.controller)
		}

		
	}
	deleteInstance(instance, instances)
	{
		for(var i=0; i< instances.length; ++i)
		{
			if(instances[i] == instance.object)
				instances.splice( i, 1 );
		}
		
		
		this.scene.remove(instance.object);
		instance.object = null
		instance = null
	}
	doInputEvents(instances)
	{
		if(this.rightControllerData == null/* || this.leftControllerData == null*/)
			return
		this.doJoystickEvents()
		if(this.isAButtonPressed(this.rightControllerData))
		{
			if(this.state == VRStates.IDLE)
			{
				if(this.instancePointed != null && this.instancePointed.object.destroyable)
					this.deleteInstance(this.instancePointed,instances)
				this.state = VRStates.DELETING_ITEM
			}
		}
		else
		{
			if(this.state == VRStates.DELETING_ITEM)
				this.state = VRStates.IDLE
		}
		if(this.isStickButtonPressed(this.rightControllerData))
		{
			if(this.state == VRStates.IDLE)
			{
				//Show UI
				var pos = new THREE.Vector3()
				var dir = new THREE.Vector3()
				this.rightControllerData.controller.getWorldPosition(pos);
			    this.rightControllerData.controller.getWorldDirection(dir);
				this.selector.showUI(pos, dir)
				this.state = VRStates.SHOWING_UI
			}
		}
		else
		{
			if(this.state == VRStates.SHOWING_UI)
			{
				//hide UI
				
				this.selector.hideUI()
				var selectedItem = this.selector.getSelectedItem()
				//TODO Instanciate selected object
				var asset = m_assetList[selectedItem.children[0].name]
				var pos = new THREE.Vector3()
				var dir = new THREE.Vector3()
				this.rightControllerData.controller.getWorldDirection(dir);
				this.rightControllerData.controller.getWorldPosition(pos)
				this.pendingAssetInstance = {
					name: asset.name,
			        pos_x: pos.x-dir.x,
			        pos_y: pos.y-dir.y,
			        pos_z: pos.z-dir.z,
			        scale: 1,
			        rot_x: 0,
			        rot_y: 0,
			        rot_z: 0
				}

				this.state = VRStates.IDLE
			}
		}
		
	}
	update(dt, instances, sceneModel)
	{

		this.updateControllers()
		this.doInputEvents(instances)
		this.updatePointedObject(instances,sceneModel)
		if(this.state == VRStates.DRAGGING)
			this.updateInstanceDragged(dt)
		if(this.state == VRStates.SHOWING_UI && this.rightControllerData != null)
		{
			var pos = new THREE.Vector3()
			this.rightControllerData.controller.getWorldPosition(pos)
			this.selector.updateUI(dt, pos)
		}
		/*const session = this.renderer.xr.getSession();
		let i = 0;
		if (session) {
	        for (const source of session.inputSources) {
	        	var handedness;
	            if (source && source.handedness) {
	                handedness = source.handedness; //left or right controllers
	            }

	            if (!source.gamepad || handedness != "right") continue;
	            const controller = this.renderer.xr.getController(i++);

	            var data = {
	                //handedness: handedness,
	                buttons: source.gamepad.buttons.map((b) => b.value),
	                axes: source.gamepad.axes.slice(0)
	            };
	            this.doVRinputEvents(controller, data)
	        }
	    }*/

		if (this.guidingController) {
	        // Controller start position
	        const p = this.guidingController.getWorldPosition(this.tempVecP);
	        //p.y = p.y+1
	        // Set Vector V to the direction of the controller, at 1m/s
	        const v = this.guidingController.getWorldDirection(this.tempVecV);
	        //v.y = v.y+1
	        // Scale the initial velocity to 6m/s
	        v.multiplyScalar(6);

	        // Time for tele ball to hit ground
	        var offsety =  0;
	        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;

	        const vertex = this.tempVec.set(0,0,0);
	        for (let i=1; i<=this.lineSegments; i++) {

	            // set vertex to current position of the virtual ball at time t
	            positionAtT(vertex,i*t/this.lineSegments,p,v,this.g);
	            this.guidingController.worldToLocal(vertex);
	            vertex.toArray(this.lineGeometryVertices,i*3);
	        }
	        this.guideline.geometry.attributes.position.needsUpdate = true;
	        
	        // Place the light and sprite near the end of the poing
	        positionAtT(this.guidelight.position,t*0.98,p,v,this.g);
	        positionAtT(this.guidesprite.position,t*0.98,p,v,this.g);
	    }
	}


	buildController( data ) {
		console.log(data)
		let geometry, material;

		switch ( data.targetRayMode ) {

			case 'tracked-pointer':

				geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 4 ], 3 ) );
				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

				material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
				material.depthTest = false;
				material.transparent = true;
				var theline = new THREE.Line( geometry, material );
				theline.renderOrder = 1
				return theline

			case 'gaze':

				geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
				material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
				return new THREE.Mesh( geometry, material );

		}

	}
	getFloorFromPos(position)
	{
		/*var auxPos = new THREE.Vector3(position.x,100 ,position.z)
		var auxUp = new THREE.Vector3(0,-1,0)
		var raycasterFloor =  new THREE.Raycaster(auxPos, auxUp);    
		var intersectsFloor = raycasterFloor.intersectObjects( m_scene_models );  
		console.log(intersectsFloor)
		if(intersectsFloor.length > 0)
		{
			var minY = 1000;
			for(var i = 0; i < intersectsFloor.length; i++)
			{
				if(intersectsFloor[i].point.y < minY)
					minY = intersectsFloor[i].point.y
			}
			return minY+0.5
		}
		else
		{
			return m_models_values[m_gui.gui_options.current_model].vr_y
		}*/
		return 0
	}

	moveVRCam(offset)
	{
		this.camera_group.position.add(offset)
	}
	getPendingAssetInstance()
	{
		return this.pendingAssetInstance
	}
	nullifyPendingAssetInstance()
	{
		this.pendingAssetInstance = null
	}
}