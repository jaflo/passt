import App from "./App.svelte";

import io from "socket.io-client";
const socket = io("localhost:3000", {path: ''});

const app = new App({
	target: document.body,
	props: {}
});

export default app;
