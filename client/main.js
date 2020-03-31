import App from "./App.svelte";

import io from "socket.io-client";
const socket = io("http://localhost:3000");

const app = new App({
	target: document.body,
	props: {}
});

export default app;
