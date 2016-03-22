var scene = new THREE.Scene();
var camera;

var renderer;
var stats;

function init () {
	var halfDim = 5;

	var geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
	var material = new THREE.MeshPhongMaterial({color: 0x1010ff});

	var clock = new THREE.Clock(true);

	for (var i=-halfDim; i<halfDim; ++i) {
		for (var j=-halfDim; j<halfDim; ++j) {
			for (var k=-halfDim; k<halfDim; ++k) {
				var cube = new THREE.Mesh(geometry, material);
				cube.position.set(i, j, k);
				scene.add(cube);
			}
		}
	}

	console.log('scene create time: ' + clock.getElapsedTime());

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
	camera.position.set(0, 0, halfDim * 4);
	camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

	scene.add(camera);

	// create light.
	var light = new THREE.DirectionalLight(0xffffff, 0.6);
	light.position.set(1, 1, 1);
	scene.add(light);

	// create WebGL renderer.
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// create statistics element.
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = 0;
	stats.domElement.style.left = 0;
	stats.domElement.style.zIndex = 100;
	document.body.appendChild(stats.domElement);
}

function render() {
	requestAnimationFrame(render);

	renderer.render(scene, camera);
	stats.update();
}

init();
render();