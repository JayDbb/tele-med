const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');
ws.on('open', () => {
  console.log('open');
  ws.send(JSON.stringify({ type: 'join', room: 'test' }));
  setTimeout(() => ws.close(), 500);
});
ws.on('message', (m) => console.log('msg', m.toString()));
ws.on('close', () => console.log('closed'));
ws.on('error', (e) => console.error('err', e));
