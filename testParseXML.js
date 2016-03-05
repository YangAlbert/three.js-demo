var xmlFileName = "test.xml";

var scene = new THREE.Scene();

var light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(2, 1, 2).normalize();
scene.add(light);

// light = new THREE.DirectionalLight(0xffffff, 2.0);
// light.position.set(0, 1, 0).normalize();
// scene.add(light);

light = new THREE.AmbientLight(0x404040);
scene.add(light);

var material = new THREE.MeshPhongMaterial({
	color: 0xaaaaaa,
	specular: 0x000000,
	shininess: 30
});

var boundingBox = {
	min: new THREE.Vector3(10000.0, 10000.0, 10000.0),
	max: new THREE.Vector3(-10000.0, -10000.0, -10000.0)
};

$.get(xmlFileName, function(d) {
	$(d).find('Polyhedron3d').each(function() {
		var $poly = $(this);

		var geometry = new THREE.BufferGeometry();

		var posArray = $poly.find('Positions').text().split(" ");
		var vertices = new Float32Array(posArray.length);
		for (var i = 0; i < posArray.length; ++i) {
			vertices[i] = parseFloat(posArray[i]);

			if (i % 3 == 2) {
				var v = new THREE.Vector3(vertices[i - 2], vertices[i - 1], vertices[i])
				boundingBox.min.min(v);
				boundingBox.max.max(v);
			}
		}
		geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

		var normArray = $poly.find('Normals').text().split(" ");
		var normals = new Float32Array(normArray.length);
		for (var i = 0; i < normArray.length; ++i) {
			normals[i] = parseFloat(normArray[i]);
		}
		geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

		var indexArray = $poly.find('Facets').text().split(" ");
		var indices = new Uint32Array(indexArray.length);
		for (var i = 0; i < indices.length; ++i) {
			indices[i] = parseInt(indexArray[i]) - 1;
		}
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));

		geometry.computeBoundingSphere();

		var mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
	});

	init();
	onAnimate();
});

var control, renderer, camera;

function init() {
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

	var center = new THREE.Vector3();
	center.addVectors(boundingBox.min, boundingBox.max);
	center.divideScalar(2.0);

	var lenVec = new THREE.Vector3();
	lenVec.subVectors(boundingBox.min, boundingBox.max);
	var length = lenVec.length();

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