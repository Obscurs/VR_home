import { Vector3, Raycaster, Math, Matrix4 } from '../../build/three.module.js';
export function getWorldIntersectFromNDCxy(camera, ndc_pos, models)
{
	camera.updateProjectionMatrix();
	var NDC_position = new Vector3(ndc_pos.x,ndc_pos.y,1);
	var pointIntersect = new Vector3();
	NDC_position.unproject(camera);

	//m_camera_list[i].getWorldDirection( directionPhoto );
	//var raycasterPhoto =  new Raycaster(camera.position, NDC_position,0, 10000); 

	 var raycaster =  new Raycaster();  

   	raycaster.setFromCamera( ndc_pos, camera );

	var intersectsPhoto = raycaster.intersectObjects( models );  




	////////////////////////////////////// BEGIN
	/*const material = new LineBasicMaterial( { color: 0x0000ff } );
	const points = [];

	points.push( camera.position );
	points.push( NDC_position );
	

	const geometry = new BufferGeometry().setFromPoints( points );
	const line = new Line( geometry, material );
	m_scene.add( line );
	m_debug.debug_mesh_lines.push(line)*/

	//console.log(intersectsPhoto)
	//console.log(ndc_pos)
	//////////////////////////////////// END
	if(intersectsPhoto.length > 0)
	{
		pointIntersect.copy(intersectsPhoto[0].point)
		////////////////////////// BEGIN
		/*const geometry2 = new SphereGeometry( 0.5, 32, 32 );
		const material2 = new MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new Mesh( geometry2, material2 );
		sphere.position.set(pointIntersect.x,pointIntersect.y,pointIntersect.z);
		sphere.name ="theball"
		sphere.scale.set( 0.01,0.01,0.01);
		m_scene.add( sphere );
		//////////////////////////// END*/
		return pointIntersect;
	} 
	else
	{
		return null;
	}
}

export function checkWallBetweenTwoPoints(point1, point2, models)
{
	var dir = new Vector3(point2.x-point1.x,point2.y-point1.y,point2.z-point1.z)
	dir.normalize();
	var raycaster =  new Raycaster(point1, dir);    
	var intersects = raycaster.intersectObjects( models );

	for(var i =0; i < intersects.length; i++)
	{
		var point = intersects[i].point
		if(point.distanceTo(point1) > 0.01 && point.distanceTo(point2) > 0.01 && point1.distanceTo(point) < point1.distanceTo(point2))
		{
			return true
		}
			
	} 
	return false
}
export function getNDCposFromWorld(camera, worldpos)
{
	if(worldpos == null)
		return null;
	var projected = new Vector3();
	projected.copy(worldpos)
	projected.project(camera)
	return projected;
}
export function getWorldFromNDC(camera, NDC_position)
{
	var res = new Vector3(NDC_position.x,NDC_position.y,NDC_position.z)
	camera.updateProjectionMatrix();
	res.unproject(camera);
	return res;
}
export function positionAtT(inVec,t,p,v,g) {
    inVec.copy(p);
    inVec.addScaledVector(v,t);
    inVec.addScaledVector(g,0.5*t**2);
    return inVec;
}

export function loadJSON(path, func)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	        var myObj = JSON.parse(this.responseText);
	        func(myObj)
	        console.log("INFO: JSON loaded: "+path)
	    }
	};
	xmlhttp.open("GET", path, true);
	console.log("INFO: Loading JSON: "+path)
	xmlhttp.send();
}
export function getDescriptorFromInstance(instance)
{
	var backupPos = new Vector3().copy(instance.position)
	instance.position.x = 0
	instance.position.y = 0
	instance.position.z = 0

	var m2 = new Matrix4();
	m2.makeRotationX(Math.degToRad(90))
	instance.applyMatrix4(m2);
	var descriptor = {
     "name":instance.name,
     "pos_x":backupPos.x,
     "pos_y":backupPos.y,
     "pos_z":backupPos.z,
     "scale":instance.scale.x,
     "rot_x":Math.radToDeg(instance.rotation.x),
     "rot_y":Math.radToDeg(instance.rotation.z),
     "rot_z":Math.radToDeg(instance.rotation.y)
  	}
  	m2.makeRotationX(Math.degToRad(-90))
  	instance.applyMatrix4(m2);
  	instance.position.copy(backupPos)
  	return descriptor
}
export function exportJSON(json)
{
	/*var fs = require('fs');
	fs.writeFile ("input.json", data, function(err) {
	    if (err) 
	    	throw err;
	    console.log('export complete');
	    }
	);*/
	var parts = []
	parts.push(json)
	var blob = new Blob(parts);
	saveAs(blob, 'exported.json')
}

export function loadObjectJSON(path, obj)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	        var myObj = JSON.parse(this.responseText);
	        obj.loadFromJSON(myObj)
	        console.log("INFO: JSON loaded: "+path)
	    }
	};
	xmlhttp.open("GET", path, true);
	console.log("INFO: Loading JSON: "+path)
	xmlhttp.send();
}

export function getFirstIntersection(modelList, modelExceptions, pos, dir)
{
	/*var pos = new THREE.Vector3()
	var dir = new THREE.Vector3()
	getControllerRight().getWorldPosition(pos);
    getControllerRight().getWorldDirection(dir);
    dir.multiplyScalar(-1)*/

    var raycasterStart =  new Raycaster(pos, dir);  
	var intersectsStart = raycasterStart.intersectObjects( modelList ); 
	for(var i=0; i < intersectsStart.length; i++)
	{
		var intersectObj = intersectsStart[i].object
		//console.log(intersectObj)
		var isException = false
		for(var j=0; j < modelExceptions.length; j++)
		{
			if(intersectObj == modelExceptions[j])
			{
				isException = true
				break
			}
		}
		
		if(!isException){
			var n = intersectsStart[ i ].face.normal.clone();
			n.transformDirection( intersectObj.matrixWorld );
			//n.multiplyScalar( 10 );
			var intersectInfo = {
				object: intersectsStart[i].object,
		    	point: intersectsStart[i].point,
		    	normal: n,
		    }
		    return intersectInfo
		}
	}
	
	return null
}