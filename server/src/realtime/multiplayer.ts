import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { allowedOrigins } from '../config/env.js';

interface MultiplayerPlayer {
  id: string;
  username: string;
  ready: boolean;
}

interface MultiplayerRoom {
  code: string;
  isPrivate: boolean;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'playing';
}

/** Monta el protocolo Socket.IO de salas en el mismo servidor HTTP de la API. */
export function attachMultiplayer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  const rooms = new Map<string, MultiplayerRoom>();

  function generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let roomCode = '';

    do {
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

  function broadcastPublicRooms(): void {
    io.emit('publicRoomList', getAvailablePublicRooms());
  }

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('createRoom', (data: { username?: unknown; isPrivate?: unknown } = {}) => {
      const username = String(data.username || '').trim().slice(0, 24);
      const isPrivate = data.isPrivate === true;

      if (!username) {
        socket.emit('error', { message: 'Escribe un nombre antes de crear la sala.' });
        return;
      }

      const roomCode = generateRoomCode();
      const room: MultiplayerRoom = {
        code: roomCode,
        isPrivate,
        players: [],
        status: 'waiting',
      };

      rooms.set(roomCode, room);
      void socket.join(roomCode);
      room.players.push({ id: socket.id, username, ready: false });

      console.log(`Sala ${isPrivate ? 'PRIVADA' : 'PÚBLICA'} creada: ${roomCode} por ${username}`);
      socket.emit('roomCreated', { roomCode, players: room.players, isPrivate });
      broadcastPublicRooms();
    });

    socket.on('joinRoom', (data: { roomCode?: unknown; username?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      const username = String(data.username || '').trim().slice(0, 24);

      if (!username) {
        socket.emit('error', { message: 'Escribe un nombre antes de entrar a la sala.' });
        return;
      }

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'La sala no existe.' });
        return;
      }

      if (room.players.length >= 5) {
        socket.emit('error', { message: 'La sala está llena.' });
        return;
      }

      if (room.players.some((player) => player.id === socket.id)) {
        socket.emit('roomJoined', { roomCode, players: room.players, isPrivate: room.isPrivate });
        return;
      }

      void socket.join(roomCode);
      room.players.push({ id: socket.id, username, ready: false });
      console.log(`${username} se unió a la sala ${roomCode}`);

      io.to(roomCode).emit('playerJoined', { players: room.players });
      socket.emit('roomJoined', { roomCode, players: room.players, isPrivate: room.isPrivate });
      broadcastPublicRooms();
    });

    socket.on('listPublicRooms', () => {
      socket.emit('publicRoomList', getAvailablePublicRooms());
    });

    socket.on('setReady', (data: { roomCode?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      const room = rooms.get(roomCode);
      const player = room?.players.find((entry) => entry.id === socket.id);
      if (!room || !player) return;

      player.ready = !player.ready;
      io.to(roomCode).emit('playerReadyChange', { players: room.players });

      const allReady = room.players.length > 0 && room.players.every((entry) => entry.ready);
      if (allReady && room.players.length >= 2) {
        room.status = 'playing';
        io.to(roomCode).emit('startGame', { map: 'level6' });
        broadcastPublicRooms();
      }
    });

    socket.on('sendMessage', (data: { roomCode?: unknown; message?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '').trim().toUpperCase();
      const room = rooms.get(roomCode);
      const player = room?.players.find((entry) => entry.id === socket.id);
      const message = String(data.message || '').trim().slice(0, 280);

      if (!player || !message) return;

      io.to(roomCode).emit('newMessage', {
        username: player.username,
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);

      rooms.forEach((room, roomCode) => {
        const playerIndex = room.players.findIndex((player) => player.id === socket.id);
        if (playerIndex === -1) return;

        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('playerLeft', { players: room.players });
        if (room.players.length === 0) rooms.delete(roomCode);
      });

      broadcastPublicRooms();
    });
  });

  return io;
}
