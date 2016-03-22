viewer.GeoManager = function() {
	this.map = new Map();
}

viewer.GeoManager.prototype = {

	var _scope = this;
	hasKey: function(key) {
		return _scope.map.has(key);
	};

	add: function(key, geometry) {
		_scope.map.set(key, geometry);
	}

	get: function(key) {
		return _scope.map.get(key);
	}
}

viewer.MatManager = function() {
	this.map = new Map();
}

viewer.MatManager.prototype = {
	var _scope = this;

	hasKey
}