const AppStates =
{
	THREE_JS_INIT: "init_state",
	LOADING_ASSETS: "loading_assets_state",
	LOADING_TEXTURES: "loading_textures_state",
	LOADING_PRECOMPUTED_DATA: "loading_precomputed_state",
	READY_TO_GO: "ready_state",
}
const VRStates =
{
	IDLE: "idle_state",
	DRAGGING: "drag_state",
	MOVING: "move_state",
}
const SCENE_MODEL_NAME = "SceneModel";
const HEIGHT_OFFSET = 1.5
const PATH_SCENE_MODEL = "models/scenes/";
const PATH_SCENE_ASSETS = "models/assets/";
const PATH_ASSETS = "assets/";
const VR_ENABLED = true;
const UI_ITEM_OFFSET = 0.1
const UI_ITEM_SIZE = 0.05
const SONG_NAMES = ["classic", "classic2", "sims2build", "sims2buy"]
var m_application_state = 
{
	state: AppStates.THREE_JS_INIT,
	three_js_inited: false,
	audio_loaded: false,
	is_playing_audio: false,
	playing_index: 0,
	songs_loaded: 0,
	json_assets_loaded: false

}
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
