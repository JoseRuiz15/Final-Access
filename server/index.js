import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = Number(process.env.SOCKET_PORT || 3001);
const app = express();
app.use(cors());
app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'socket.io', port: PORT });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'https://final-access.onrender.com',
    methods: ['GET', 'POST']
  }
});

// Estado global de las salas
const rooms = new Map();

function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let roomCode;

  do {
    // Formato: Letra + Número + Número + Letra (ej: R13W)
    roomCode =
      letters.charAt(Math.floor(Math.random() * letters.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      letters.charAt(Math.floor(Math.random() * letters.length));
  } while (rooms.has(roomCode));

  return roomCode;
}

function getAvailablePublicRooms() {
  return Array.from(rooms.values())
    .filter((room) => !room.isPrivate && room.status === 'waiting' && room.players.length < 5)
    .map((room) => ({
      code: room.code,
      username: room.players[0]?.username || 'Jugador',
      playerCount: room.players.length,
    }));
}

function broadcastPublicRooms() {
  io.emit('publicRoomList', getAvailablePublicRooms());
}

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // --- GESTIÓN DE SALAS ---

  socket.on('createRoom', (data = {}) => {
    const username = String(data.username || '').trim().slice(0, 24);
    const isPrivate = data.isPrivate === true;

    if (!username) {
      return socket.emit('error', { message: 'Escribe un nombre antes de crear la sala.' });
    }

    const roomCode = generateRoomCode();

    const newRoom = {
      code: roomCode,
      isPrivate: isPrivate === true,
      players: [],
      status: 'waiting'
    };

    rooms.set(roomCode, newRoom);

    // Unir al creador a la sala
    socket.join(roomCode);
    const player = { id: socket.id, username, ready: false };
    newRoom.players.push(player);

    console.log(`Sala ${newRoom.isPrivate ? 'PRIVADA' : 'PÚBLICA'} creada: ${roomCode} por ${username}`);

    socket.emit('roomCreated', { roomCode, players: newRoom.players, isPrivate: newRoom.isPrivate });
    broadcastPublicRooms();
  });

  socket.on('joinRoom', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase();
    const username = String(data.username || '').trim().slice(0, 24);

    if (!username) {
      return socket.emit('error', { message: 'Escribe un nombre antes de entrar a la sala.' });
    }

    const room = rooms.get(roomCode);

    if (!room) {
      return socket.emit('error', { message: 'La sala no existe.' });
    }

    if (room.players.length >= 5) {
      return socket.emit('error', { message: 'La sala está llena.' });
    }

    if (room.players.some((player) => player.id === socket.id)) {
      return socket.emit('roomJoined', {
        roomCode,
        players: room.players,
        isPrivate: room.isPrivate,
      });
    }

    socket.join(roomCode);
    const player = { id: socket.id, username, ready: false };
    room.players.push(player);

    console.log(`${username} se unió a la sala ${roomCode}`);
    
    // Notificar a todos en la sala que alguien entró
    io.to(roomCode).emit('playerJoined', { players: room.players });
    
    // Enviar datos iniciales al jugador que entró
    socket.emit('roomJoined', { roomCode, players: room.players, isPrivate: room.isPrivate });
    broadcastPublicRooms();
  });

  // --- LISTADO DE SALAS PÚBLICAS ---

  socket.on('listPublicRooms', () => {
    socket.emit('publicRoomList', getAvailablePublicRooms());
  });

  // --- LÓGICA DE LOBBY ---

  socket.on('setReady', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);

    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.ready = !player.ready;
        io.to(roomCode).emit('playerReadyChange', { players: room.players });

        // Verificar si todos están listos
        const allReady = room.players.length > 0 && room.players.every(p => p.ready);
        if (allReady && room.players.length >= 2) { // Mínimo 2 para empezar
          room.status = 'playing';
          io.to(roomCode).emit('startGame', { map: 'level6' }); 
          broadcastPublicRooms();
        }
      }
    }
  });

  // --- CHAT ---

  socket.on('sendMessage', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase();
    const room = rooms.get(roomCode);
    const player = room?.players.find((entry) => entry.id === socket.id);
    const message = String(data.message || '').trim().slice(0, 280);

    if (!player || !message) return;

    // Retransmitir el mensaje a todos en la sala incluyendo el remitente
    io.to(roomCode).emit('newMessage', {
      username: player.username,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // --- DESCONEXIÓN ---

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    
    // Eliminar jugador de cualquier sala
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('playerLeft', { players: room.players });
        
        // Si la sala queda vacía, eliminarla
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        }
      }
    });

    broadcastPublicRooms();
  });
});

// El API Fastify ya usa el puerto 3000; Socket.IO corre aparte en el 3001.
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Multijugador corriendo en http://localhost:${PORT}`);
});
