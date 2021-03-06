// try {
// 	var socket = new WebSocket('ws://127.0.0.1:8887');
// 	socket.onerror = function(event) {
// 		console.log('open websocket failed.');
// 	}

// 	socket.onopen = function(event) {
// 		console.log('websocket opened.');
// 		socket.send('test data...');
// 	}
// } catch (e) {
// 	console.log('Exception: ' + e);
// }

function WebSocketTest() {
	if ("WebSocket" in window) {
		alert("WebSocket is supported by your Browser!");

		// Let us open a web socket
		var ws = new WebSocket("ws://localhost:8500");

		ws.onopen = function() {
			// Web Socket is connected, send data using send()
			ws.send("Message to send");
			alert("Message is sent...");
		};

		ws.onmessage = function(evt) {
			var received_msg = evt.data;
			alert("Message is received...");
		};

		ws.onclose = function() {
			// websocket is closed.
			alert("Connection is closed...");
		};
	} else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
}