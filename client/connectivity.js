import io from "socket.io-client";
export const socket = io.connect("http://passt.herokuapp.com");

// CREATE_ROOM = "createRoom",
// ROOM_CREATED = "roomCreated",
// JOIN_ROOM = "joinRoom",
// JOINED_SUCCESSFULLY = "joinedSuccessfully",
// NEW_PLAYER = "newPlayer",
// START_ROOM = "startRoom",
// ROOM_STARTED = "roomStarted",
// PLAYER_DISCONNECTED = "playerDisconnected",

socket.emit("createRoom", { open: false });

socket.on("roomCreated", function(data) {
	console.log(data);
	socket.emit("joinRoom", { roomCode: data.roomCode, playerName: "test" });
});

socket.on("joinedSuccessfully", function(data) {
	console.log(data);
	socket.emit("startRoom");
});
