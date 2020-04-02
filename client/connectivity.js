import io from "socket.io-client";
export const socket = io.connect("https://passt.herokuapp.com");
