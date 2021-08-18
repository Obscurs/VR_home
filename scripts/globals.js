const AppStates =
{
	WAITING_INIT_DECISION: "init_decision",
	THREE_JS_INIT: "init_state",
	LOADING_ASSETS: "loading_assets_state",
	LOADING_TEXTURES: "loading_textures_state",
	LOADING_PRECOMPUTED_DATA: "loading_precomputed_state",
	READY_TO_GO: "ready_state",
}


const SCENE_MODEL_NAME = "SceneModel";

const PATH_SCENE_MODEL = "models/scenes/";
const PATH_SCENE_ASSETS = "models/assets/";
const PATH_ASSETS = "assets/";
const VR_ENABLED = false;


const SONG_NAMES = ["classic", "classic2", "sims2build", "sims2buy"]
var m_application_state = 
{
	state: AppStates.WAITING_INIT_DECISION,
	three_js_inited: false,
	audio_loaded: false,
	is_playing_audio: false,
	playing_index: 1,
	songs_loaded: 0,
	json_assets_loaded: false,


}
let m_importedData = null;
let m_controls;
let m_renderer;
let m_scene;
let m_assetList = [];
let m_sceneModel;
let m_camera;
let m_container;
let m_instances = [];
let m_VRControls;
let m_songs = [];
let m_selector;
let m_composer;
