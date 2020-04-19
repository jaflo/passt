import io from 'socket.io-client';

const socket = io.connect('https://passt.herokuapp.com');
export default socket;
