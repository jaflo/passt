import * as http from 'http';
import socketIo from 'socket.io';
import * as socketFunctions from './socketFunctions';
import { mongoose } from '@typegoose/typegoose';
import { exit } from 'process';
import { seedCards } from './seedCards';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passt';
if (!MONGODB_URI) {
    console.error('Please set the MONGODB_URI environment variable');
    exit(1);
}

const app = http.createServer();
const io = socketIo(app);

io.on('connection', (socket) => {
    socket.on('join', () => socketFunctions.joinRoom)
})

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    seedCards().then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`)
        });
    });
}).catch((err) => console.error(err));