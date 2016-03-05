var scene = new THREE.Scene();

var light = new THREE.DirectionalLight(0xeeeeee, 1.0);
light.position.set(5, 1, -2).normalize();
scene.add(light);

light = new THREE.AmbientLight(0x101010);
scene.add(light);

init();
onAnimate();

function init() {
	var onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			var percentCompleted = xhr.loaded / xhr.total * 100;
			console.log(Math.round(percentCompleted, 2) + "% downloaded");
		}
	};

	var onError = function (xhr) {};

	var mat = new THREE.MeshPhongMaterial({color:0xffd700, specular:0x101010, shininess:120});

	var objLoader = new THREE.OBJLoader();
	// objLoader.setMaterials(materials);
	objLoader.setPath('model/');
	objLoader.load('buddha.obj', function(object) {
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = mat;
			}
		});
		// object.position.y = -95;
		scene.add(object);
	}, onProgress, onError);

	// var mtlLoader = new THREE.MTLLoader();
	// mtlLoader.setBaseUrl('model/teapot/');
	// mtlLoader.setPath('model/teapot/');
	// mtlLoader.load('default.mtl', function(materials) {
	// 	materials.preload();

	// 	var objLoader = new THREE.OBJLoader();
	// 	objLoader.setMaterials(materials);
	// 	objLoader.setPath('model/teapot/');
	// 	objLoader.load('teapot.obj', function (object) {
	// 		object.position.y = -95;
	// 		scene.add(object);
	// 	}, onProgress, onError);
	// });

	initEnv();
}

var control, renderer, camera;

function initEnv() {
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	control = new THREE.TrackballControls(camera);
	control.rotateSpeed = 12.0;
	control.zoomSpeed = 10;
	control.panSpeed = 0.8;

	control.noZoom = false;
	control.noPan = false;

	control.staticMoving = true;
	control.keys = [65, 83, 68];

	control.addEventListener('change', onRender);

	// var center = new THREE.Vector3();
	// center.addVectors(boundingBox.min, boundingBox.max);
	// center.divideScalar(2.0);

	// var lenVec = new THREE.Vector3();
	// lenVec.subVectors(boundingBox.min, boundingBox.max);
	// var length = lenVec.length();

	// camera.position = center - (camera.getWorldDirection() * length * 1.5);
	// camera.lookAt(center);

	camera.position.z = 20;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	onRender();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	control.handleResize();

	onRender();
}

function onAnimate() {
	requestAnimationFrame(onAnimate);
	control.update();	
}

function onRender() {
	renderer.render(scene, camera);
}