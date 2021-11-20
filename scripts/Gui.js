import { GUI } from './../jsm/libs/dat.gui.module.js';
import { HTMLMesh } from './../jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from './../jsm/interactive/InteractiveGroup.js';

var modelChanged = false
var showViewChanged = false
var updateGuiNormal = false
var updateGuiVR = false
export class Gui {
	
	constructor()
	{	
		//this.is_vr = false;
		this.gui_options =
		{
			projection: 1,
			orientation: 0,
			position: 0,
			timer_recalc: 1,

			max_num_collections: 6,
			max_collection_size: 5,
			similitude_treshold: 0.7,
			discard_too_similar: true,
			clustering_method: 'single_linkage',
			clustering_method_aux: false,

			red_area_enabled: false,
			show_camera_enabled: false,
			show_view_enabled: false,
			show_photo_enabled: false,
			project_capture_enabled: true,
			auto_score_enabled: false,
			show_photo_collection: true,
			current_model: "pedret",

		}
		this.gui_options_vr =
		{

			current_model_aux1: false,
			current_model_aux2: false,
			current_model_aux3: false,

		}
		this.gui = new GUI();

		this.gui_vr_enabled = false

		this.addElemsGui()

		this.gui_vr = new GUI();
		this.addElemsGuiVR()
		this.enabled = true
		
		
	}
	
	_updateGuiVR()
	{
		updateGuiVR = false;
		if(this.gui_options_vr.current_model_aux1)
		{
			this.gui_options_vr.current_model_aux1 = false
			this.gui_options.current_model = "pedret",
			modelChanged = true;
		}
		else if(this.gui_options_vr.current_model_aux2)
		{
			this.gui_options_vr.current_model_aux2 = false
			this.gui_options.current_model = "doma",
			modelChanged = true;
		}
		else if(this.gui_options_vr.current_model_aux3)
		{
			this.gui_options_vr.current_model_aux3 = false
			this.gui_options.current_model = "solsona",
			modelChanged = true;
		}

		
	}
	_updateGuiNormal()
	{
		updateGuiNormal = false;

	}
	addElemsGui()
	{
		const models = [ 'pedret', 'doma','solsona'];
		const clustering_methods = [ 'normal', 'single_linkage'];
		this.modelsFolder = this.gui.addFolder( 'Models' );

		

		this.modelsFolder.open();

		this.scoreFolder = this.gui.addFolder( 'Score computation' );
		
		
		this.modelsFolder.add( this.gui_options, 'current_model' ).options( models ).name( 'Current model' ).listen().onChange( function () {
			modelChanged = true
		} );
		this.scoreFolder.add(this.gui_options, 'projection', 0, 1, 0.1 ).name( 'View' );
		this.scoreFolder.add(this.gui_options, 'position', 0, 1, 0.1 ).name( 'Position' );
		this.scoreFolder.add(this.gui_options, 'orientation', 0, 1, 0.1 ).name( 'Orientation' );
		this.scoreFolder.add(this.gui_options, 'timer_recalc', 0, 10, 0.1 ).name( 'Recalc timer' );

		//this.scoreFolder.open();

		this.viewFolder = this.gui.addFolder( 'Display options' );


		this.viewFolder.add(this.gui_options, 'red_area_enabled').name( 'Show highlighted area' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'show_camera_enabled').name( 'Show camera' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'show_photo_enabled').name( 'Show photo' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'project_capture_enabled').name( 'Show projection' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'show_view_enabled').name( 'Show view' ).listen().onChange(function ()
		{
			showViewChanged = true
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'auto_score_enabled').name( 'Auto-detect' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.add(this.gui_options, 'show_photo_collection').name( 'Show collection' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.viewFolder.open();


		this.candidatesFolder = this.gui.addFolder( 'Candidate selection' );

		

		this.candidatesFolder.add(this.gui_options, 'max_num_collections', 0, 10, 1 ).name( 'Max num collections' );
		this.candidatesFolder.add(this.gui_options, 'max_collection_size', 0, 15, 1 ).name( 'Max size stack' );
		this.candidatesFolder.add(this.gui_options, 'similitude_treshold', 0, 1, 0.01 ).name( 'Simil treshold' );
		//this.gui.add(this.gui_options, 'linkage_enabled').name( 'Linkage clustering' );
		this.candidatesFolder.add( this.gui_options, 'clustering_method' ).options( clustering_methods ).name( 'Cluster method' ).onChange(function ()
		{

		});
		//this.candidatesFolder.open();
	}
	addElemsGuiVR()
	{
		this.gui_vr.add(this.gui_options, 'red_area_enabled').name( 'Show area' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
		});
		this.gui_vr.add(this.gui_options, 'show_camera_enabled').name( 'Show camera' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
		});
		this.gui_vr.add(this.gui_options, 'show_photo_enabled').name( 'Show photo' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
		});
		this.gui_vr.add(this.gui_options, 'project_capture_enabled').name( 'Show projection' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
		});
		this.gui_vr.add(this.gui_options, 'show_view_enabled').name( 'Show view' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
			
		});
		this.gui_vr.add(this.gui_options, 'auto_score_enabled').name( 'Auto-detect' ).listen().onChange(function ()
		{
			updateGuiNormal = true;
		});
		/*this.gui_vr.add(this.gui_options_vr, 'current_model_aux1').name( 'Visit Pedret' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.gui_vr.add(this.gui_options_vr, 'current_model_aux2').name( 'Visit Doma' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});
		this.gui_vr.add(this.gui_options_vr, 'current_model_aux3').name( 'Visit Solsona' ).listen().onChange(function ()
		{
			updateGuiVR = true;
		});*/
		this.checkViewChanged = false
		this.disableVRgui()

	}
	updateGuiVRNames()
	{
		this.gui_vr.__controllers[0].name(this.gui_options.red_area_enabled ? 'Disable highlighted area' : 'Enable highlighted area')
		this.gui_vr.__controllers[1].name(this.gui_options.show_camera_enabled ? 'Hide Camera' : 'Show Camera')
		this.gui_vr.__controllers[2].name(this.gui_options.show_photo_enabled ? 'Hide Photo' : 'Show Photo')
		this.gui_vr.__controllers[3].name(this.gui_options.project_capture_enabled ? 'Hide Projection' : 'Show Projection')
		this.gui_vr.__controllers[4].name(this.gui_options.show_view_enabled ? 'Hide View' : 'Show View')
		this.gui_vr.__controllers[5].name(this.gui_options.auto_score_enabled ? 'Disable auto-suggest' : 'Enable auto-suggest')
		if(this.gui_vr_enabled)
		{
			this.disableVRgui()
			this.enableVRgui()
		}
		
	}

	update(isVr)
	{
		if(updateGuiNormal)
		{
			this._updateGuiNormal()
			this.updateGuiVRNames()
			this.checkViewChanged = true;
		}
		else if(updateGuiVR)
		{
			this._updateGuiVR()
			this.updateGuiVRNames()
			this.checkViewChanged = true;
		}
		
		if(showViewChanged)
		{
			if(this.gui_options.show_view_enabled)
			{
				document.getElementById("info2").style.visibility = "visible";
			}
			else
			{
				document.getElementById("info2").style.visibility = "hidden";
			}
			showViewChanged = false;

		}
		if(modelChanged)
		{
			modelChanged = false;
			return true;
			
		}
		/*if(isVr != this.is_vr)
			this.changeMode(isVr)*/
		return false;
	}
	/*changeMode(is_vr)
	{
		this.is_vr = is_vr

	}*/
	initInteractiveGroup(renderer, camera, scene, vr_panels_group, vrgui)
	{
		
		this.interactiveGroup = new InteractiveGroup( renderer, camera );
		
		
		vr_panels_group.add(this.interactiveGroup)
		//scene.add( group );
	}
	clearInteractiveGroup(vr_panels_group)
	{
		if(this.interactiveGroup)
		{
			while(this.interactiveGroup.children.length > 0)
			{
				this.interactiveGroup.remove(this.interactiveGroup.children[0])
			}
			vr_panels_group.remove(this.interactiveGroup)
		}
			
			
	}
	enableVRgui()
	{
		this.gui_vr_enabled = true
		this.gui_vr.__controllers[0].name(this.gui_options.red_area_enabled ? 'Disable highlighted area' : 'Enable highlighted area')
		this.gui_vr.__controllers[1].name(this.gui_options.show_camera_enabled ? 'Hide Camera' : 'Show Camera')
		this.gui_vr.__controllers[2].name(this.gui_options.show_photo_enabled ? 'Hide Photo' : 'Show Photo')
		this.gui_vr.__controllers[3].name(this.gui_options.project_capture_enabled ? 'Hide Projection' : 'Show Projection')
		this.gui_vr.__controllers[4].name(this.gui_options.show_view_enabled ? 'Hide View' : 'Show View')
		this.gui_vr.__controllers[5].name(this.gui_options.auto_score_enabled ? 'Disable auto-suggest' : 'Enable auto-suggest')
		this.gui_vr.domElement.style.display = '';
		const mesh = new HTMLMesh( this.gui_vr.domElement );
		mesh.renderOrder = 1
		mesh.material.depthTest = false;
		mesh.position.x = - 0.5;
		mesh.position.y = 0;
		mesh.position.z = - 1.2;
		mesh.rotation.y = Math.PI / 4;
		mesh.scale.setScalar( 2 );
		//group.add( mesh );
		m_vr_move_utils.vrgui = mesh;
		if(this.interactiveGroup)
			this.interactiveGroup.add(m_vr_move_utils.vrgui)
	}
	disableVRgui()
	{
		this.gui_vr.domElement.style.display = 'none';
		this.gui_vr_enabled = false
		if(this.interactiveGroup)
		{
			while(this.interactiveGroup.children.length > 0)
			{
				this.interactiveGroup.remove(this.interactiveGroup.children[0])
			}
			this.interactiveGroup.remove(m_vr_move_utils.vrgui);
		}
			
	}

	enableGui()
	{
		this.enabled = true
		this.gui.domElement.style.display = '';
	}
	disableGui()
	{
		this.enabled = false
		this.gui.domElement.style.display = 'none';
	}
	removeFocus()
	{
		this.gui.domElement.blur()
	}
}