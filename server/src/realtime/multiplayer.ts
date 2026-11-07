import type { Server as HttpServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { Server } from 'socket.io';
import { allowedOrigins } from '../config/env.js';

interface MultiplayerPlayer {
  id: string;
  username: string;
  ready: boolean;
}

interface MultiplayerRoom {
  code: string;
  name: string;
  maxPlayers: number;
  friendUsernames: string[];
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
  const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function normalizeUsername(username: unknown): string {
    return String(username || '').trim().slice(0, 24).toLocaleLowerCase();
  }

  function generateRoomCode(): string {
    let roomCode = '';

    do {
      roomCode = Array.from(randomBytes(8), (byte) => codeAlphabet[byte % codeAlphabet.length]).join('');
    } while (rooms.has(roomCode));

    return roomCode;
  }

  function getAvailableRooms(filter = 'public', username = '') {
    return Array.from(rooms.values())
      .filter((room) => {
        const available = room.status === 'waiting' && room.players.length < room.maxPlayers;
        if (!available) return false;
        if (filter === 'friends') {
          return room.isPrivate && room.friendUsernames.includes(normalizeUsername(username));
        }
        return !room.isPrivate;
      })
      .map((room) => ({
        code: room.code,
        name: room.name,
        username: room.players[0]?.username || 'Jugador',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
      }));
  }

  function broadcastRoomLists(): void {
    for (const client of io.sockets.sockets.values()) {
      client.emit('roomList', getAvailableRooms(client.data.roomFilter, client.data.username));
    }
  }

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('createRoom', (data: { username?: unknown; isPrivate?: unknown; name?: unknown; maxPlayers?: unknown; friendUsernames?: unknown } = {}) => {
      const username = String(data.username || '').trim().slice(0, 24);
      const name = String(data.name || '').trim().slice(0, 64);
      const isPrivate = data.isPrivate === true;
      const requestedCapacity = Number(data.maxPlayers);
      const maxPlayers = Number.isInteger(requestedCapacity) && requestedCapacity >= 2 && requestedCapacity <= 10
        ? requestedCapacity
        : 4;
      const friendUsernames = Array.isArray(data.friendUsernames)
        ? data.friendUsernames.map(normalizeUsername).filter(Boolean).slice(0, 20)
        : [];

      if (!username) {
        socket.emit('error', { message: 'Escribe un nombre antes de crear la sala.' });
        return;
      }
      if (!name) {
        socket.emit('error', { message: 'Escribe un nombre para la sala.' });
        return;
      }

      const roomCode = generateRoomCode();
      const room: MultiplayerRoom = {
        code: roomCode,
        name,
        maxPlayers,
        friendUsernames: [...new Set([normalizeUsername(username), ...friendUsernames])],
        isPrivate,
        players: [],
        status: 'waiting',
      };

      rooms.set(roomCode, room);
      void socket.join(roomCode);
      socket.data.username = normalizeUsername(username);
      socket.data.roomFilter = socket.data.roomFilter || 'public';
      room.players.push({ id: socket.id, username, ready: false });

      console.log(`Sala ${isPrivate ? 'PRIVADA' : 'PÚBLICA'} creada: ${roomCode} por ${username}`);
      socket.emit('roomCreated', { roomCode, name, maxPlayers, players: room.players, isPrivate });
      broadcastRoomLists();
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

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: 'La sala está llena.' });
        return;
      }

      if (room.players.some((player) => player.id === socket.id)) {
        socket.emit('roomJoined', { roomCode, name: room.name, maxPlayers: room.maxPlayers, players: room.players, isPrivate: room.isPrivate });
        return;
      }

      void socket.join(roomCode);
      socket.data.username = normalizeUsername(username);
      room.players.push({ id: socket.id, username, ready: false });
      console.log(`${username} se unió a la sala ${roomCode}`);

      io.to(roomCode).emit('playerJoined', { players: room.players });
      socket.emit('roomJoined', { roomCode, name: room.name, maxPlayers: room.maxPlayers, players: room.players, isPrivate: room.isPrivate });
      broadcastRoomLists();
    });

    socket.on('listRooms', (data: { filter?: unknown; username?: unknown } = {}) => {
      const filter = data.filter === 'friends' ? 'friends' : 'public';
      const username = normalizeUsername(data.username);
      socket.data.username = username;
      socket.data.roomFilter = filter;
      socket.emit('roomList', getAvailableRooms(filter, username));
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
        broadcastRoomLists();
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

      broadcastRoomLists();
    });
  });

  return io;
}
