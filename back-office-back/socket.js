const { Server } = require('socket.io');

let io = null;

exports.init = (server, options = {}) => {
  if (io) return io;
  const allowedOriginsEnv = process.env.CORS_ORIGIN || '';
  const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim()).filter(Boolean);

  const corsOptions = {
    methods: ['GET', 'POST'],
    origin: (origin, callback) => {
      // If no origin (server-to-server), allow
      if (!origin) return callback(null, true);
      // If no allowed origins set, allow all (dev comfortable default)
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed'), false);
    },
  };

  io = new Server(server, Object.assign({ cors: corsOptions }, options));

  io.on('connection', (socket) => {
    console.log('A client connected to sockets:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket not initialized, call init(server) first.');
  return io;
};
