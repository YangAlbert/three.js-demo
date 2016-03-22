var xmlFileName = "sample123.xml_Processed.xml";

var scene = new THREE.Scene();
var octree;

var light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(2, 1, 2).normalize();
scene.add(light);

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

var geoMap = new Map();
var matMap = new Map();

$.get(xmlFileName, function(d) {
	init();

	$(d).find('Polyhedron3d').each(function() {
		var $poly = $(this);

		var key = $poly.find('Key').text();
		var geo = geoMap.get(key);
		if (geo == undefined) {
			geo = new THREE.BufferGeometry();

			var posArray = $poly.find('Positions').text().split(" ");
			var vertices = new Float32Array(posArray.length);
			for (var i = 0; i < posArray.length; ++i) {
				vertices[i] = parseFloat(posArray[i]);
			}
			geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

			var normArray = $poly.find('Normals').text().split(" ");
			var normals = new Float32Array(normArray.length);
			for (var i = 0; i < normArray.length; ++i) {
				normals[i] = parseFloat(normArray[i]);
			}
			geo.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

			var indexArray = $poly.find('Facets').text().split(" ");
			var indices = new Uint32Array(indexArray.length);
			for (var i = 0; i < indices.length; ++i) {
				indices[i] = parseInt(indexArray[i]) - 1;
			}
			geo.setIndex(new THREE.BufferAttribute(indices, 1));

			geo.computeBoundingSphere();

			geo.computeBoundingBox();

			// add to map
			geoMap.set(key, geo);
		}

		var colorKey = $poly.siblings("Color:first-of-type").text();
		var mat = matMap.get(colorKey);
		if (mat == undefined) {
			var colorArr = colorKey.split(',');
			var colorVal = parseInt(colorArr[0]);
			colorVal = (colorVal << 4) | parseInt(colorArr[1]);
			colorVal = (colorVal << 4) | parseInt(colorArr[2]);

			mat = new THREE.MeshPhongMaterial({
				color: colorVal
			});

			matMap.set(colorKey, mat);
		}

		var origin = $poly.find("Origin").text().split(' ');
		for (var i = 0; i < origin.length; ++i) {
			origin[i] = parseFloat(origin[i]);
		}

		var mesh = new THREE.Mesh(geo, mat);
		mesh.position.set(origin[0], origin[1], origin[2]);
		mesh.updateMatrix();

		var bbMin = geo.bondingBox.min.clone();
		var bbMax = geo.bondingBox.max.clone();

		scene.add(mesh);
		octree.add(mesh, {useFaces: false});
		objects.push(mesh);
	});

	zoomAll();
	onAnimate();
});

var control, renderer, camera;

var objects = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var interObj;
var highlightMat = new THREE.MeshPhongMaterial({
	color: 0xffff00
});
var originMat;
var pickMode = false;

function init() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

	octree = new THREE.Octree({
		// uncomment below to see the octree (may kill the fps)
		//scene: scene,
		// when undeferred = true, objects are inserted immediately
		// instead of being deferred until next octree.update() call
		// this may decrease performance as it forces a matrix update
		undeferred: false,
		// set the max depth of tree
		depthMax: Infinity,
		// max number of objects before nodes split or merge
		objectsThreshold: 8,
		// percent between 0 and 1 that nodes will overlap each other
		// helps insert objects that lie over more than one node
		overlapPct: 0.15
	});

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

	// camera.position.z = 20;

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	var disHighlight = function() {
		if (interObj) {
			interObj.material = originMat;
			interObj = null;
		}
	}

	var highlight = function(obj) {
		interObj = obj;
		originMat = obj.material;
		obj.material = highlightMat;
	}

	window.addEventListener('resize', onWindowResize, false);

	window.addEventListener('keydown', function(event) {
		if (event.keyCode == 17) { // 'Ctrl'
			pickMode = true;
		} else if (event.keyCode == 27) {	// 'ESC'
			disHighlight();
			onRender();
		}
	}, false);

	window.addEventListener('keyup', function(event) {
		if (event.keyCode == 17) {	// 'Ctrl'
			pickMode = false;
		}
	}, false);

	renderer.domElement.addEventListener('mousedown', function(event) {
		if (!pickMode) return;

		// reset last picked obj.
		disHighlight();

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var octreeObjs = octree.search(raycaster.ray.origin, raycaster.ray.far, false, raycaster.ray.direction);
		var intersections = raycaster.intersectOctreeObjects(octreeObjs);
		// var intersections = raycaster.intersectObjects(objects);
		intersections.sort(function (a, b) {
			return a.distance - b.distance;
		})

		if (intersections.length > 0) {
			highlight(intersections[0].object);
		}

		onRender();

	}, false);

}

function zoomAll() {
	var centerPt = new THREE.Vector3();
	centerPt.addVectors(boundingBox.min, boundingBox.max);
	centerPt.multiplyScalar(0.5);

	var sizeVec = new THREE.Vector3();
	sizeVec.subVectors(boundingBox.max, boundingBox.min);
	var size = sizeVec.length();

	var pos = new THREE.Vector3();
	pos.subVectors(centerPt, new THREE.Vector3(0, 0, size * 1.5));

	camera.position = pos;
	camera.lookAt(centerPt);

	console.log(pos);
	console.log(centerPt);
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
	octree.update();
	
	onRender();
}

function onRender() {
	renderer.render(scene, camera);
}

function onKeyDown() {

}