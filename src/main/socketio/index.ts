import { io } from 'socket.io-client';
import { app } from 'electron';

const socket = io('http://localhost:3001', { path: '/api/socketio', autoConnect: false });

// TODO: Use these to pass info to the renderer
export function socketIOConnect() {
  socket.connect();

  // Event handlers
  socket.on('connect', () => {
    console.log('Connected to Civitai Link Server');
    socket.emit('iam', { type: 'sd' });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Civitai Link Server');
  });

  socket.on('error', (err) => {
    console.log(err);
  });

  app.on('before-quit', () => {
    socket.close();
  });
}
