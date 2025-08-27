// const { createServer } = require('http');
// const { parse } = require('url');
// const next = require('next');
// const { Server } = require('socket.io');

// const dev = process.env.NODE_ENV !== 'production';
// const hostname = 'localhost';
// const port = process.env.PORT || 3000;

// // Initialize Next.js app
// const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   // Create HTTP server
//   const httpServer = createServer(async (req, res) => {
//     try {
//       const parsedUrl = parse(req.url, true);
//       await handle(req, res, parsedUrl);
//     } catch (err) {
//       console.error('Error occurred handling', req.url, err);
//       res.statusCode = 500;
//       res.end('internal server error');
//     }
//   });

//   // Initialize Socket.io
//   const io = new Server(httpServer, {
//     cors: {
//       origin: dev ? "http://localhost:3000" : false,
//       methods: ["GET", "POST"]
//     }
//   });

//   // Store active connections
//   const activeConnections = new Map();

//   // Socket.io connection handling
//   io.on('connection', (socket) => {
//     console.log('Client connected:', socket.id);

//     // Handle room joining
//     socket.on('join-room', async (data) => {
//       const { roomId, playerId, playerName } = data;
      
//       try {
//         // Store connection info
//         activeConnections.set(socket.id, { playerId, roomId });
        
//         // Join socket room
//         await socket.join(roomId);
        
//         // Notify other players
//         socket.to(roomId).emit('player-joined', {
//           playerId,
//           playerName,
//           timestamp: new Date()
//         });
        
//         console.log(`Player ${playerId} joined room ${roomId}`);
//       } catch (error) {
//         console.error('Error joining room:', error);
//         socket.emit('error', { message: 'Failed to join room' });
//       }
//     });

//     // Handle room leaving
//     socket.on('leave-room', async (data) => {
//       const { roomId, playerId } = data;
      
//       try {
//         await socket.leave(roomId);
//         activeConnections.delete(socket.id);
        
//         // Notify other players
//         socket.to(roomId).emit('player-left', {
//           playerId,
//           timestamp: new Date()
//         });
        
//         console.log(`Player ${playerId} left room ${roomId}`);
//       } catch (error) {
//         console.error('Error leaving room:', error);
//       }
//     });

//     // Handle story updates
//     socket.on('story-update', (data) => {
//       const { roomId, storyUpdate } = data;
      
//       // Broadcast to all players in room
//       socket.to(roomId).emit('story-updated', storyUpdate);
//     });

//     // Handle turn changes
//     socket.on('turn-change', (data) => {
//       const { roomId, nextPlayerId, turnData } = data;
      
//       // Broadcast turn change to all players
//       io.to(roomId).emit('turn-changed', {
//         nextPlayerId,
//         turnData,
//         timestamp: new Date()
//       });
//     });

//     // Handle choice made
//     socket.on('choice-made', (data) => {
//       const { roomId, choice, playerId } = data;
      
//       // Broadcast choice to all players
//       socket.to(roomId).emit('choice-received', {
//         choice,
//         playerId,
//         timestamp: new Date()
//       });
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       const connectionInfo = activeConnections.get(socket.id);
      
//       if (connectionInfo) {
//         const { playerId, roomId } = connectionInfo;
        
//         // Notify other players of disconnection
//         socket.to(roomId).emit('player-disconnected', {
//           playerId,
//           timestamp: new Date()
//         });
        
//         activeConnections.delete(socket.id);
//         console.log(`Player ${playerId} disconnected from room ${roomId}`);
//       }
//     });
//   });

//   // Start server
//   httpServer
//     .once('error', (err) => {
//       console.error(err);
//       process.exit(1);
//     })
//     .listen(port, () => {
//       console.log(`> Ready on http://${hostname}:${port}`);
//     });
// });