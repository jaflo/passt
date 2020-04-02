import io from "socket.io-client";
export const socket = io.connect("http://passt.herokuapp.com");
