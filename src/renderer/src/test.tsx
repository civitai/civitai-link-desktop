import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/api/socketio');

const Home = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReady, setIsReady] = useState(false);
  const [clientType, setClientType] = useState<'client' | 'sd'>('client');
  const typeRef = useRef<HTMLSelectElement | null>(null);
  const commandRef = useRef<HTMLSelectElement | null>(null);
  const roomRef = useRef<HTMLInputElement | null>(null);
  const payloadRef = useRef<HTMLTextAreaElement | null>(null);
  const imgOutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
      setIsConnected(true);
    });
    socket.connect();

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('roomPresence', (data) => {
      console.log('roomPresence', data);
      setIsReady(data.client > 0 && data.sd > 0);
    });

    socket.on('commandStatus', (data) => {
      console.log('commandStatus', data);
      if (data.type === 'image:txt2img' && imgOutRef.current) {
        if (data.status === 'success') {
          const [base64Image] = data.images;
          const img = document.createElement('img');
          img.src = 'data:image/png;base64,' + base64Image;
          img.style.width = '100%';
          imgOutRef.current.prepend(img);
        } else {
          console.error(data.error);
        }
      }
    });

    socket.on('upgradeKey', (data) => {
      console.log('upgradeKey', data);
    });

    socket.on('error', (err) => {
      console.log('error', err.msg);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomPresence');
      socket.off('commandStatus');
      socket.off('upgradeKey');
      socket.off('error');
    };
  }, []);

  const joinRoom = () => {
    const room = roomRef.current?.value;
    if (!room) return;
    const type = typeRef.current?.value as 'client' | 'sd';
    setClientType(type);
    socket.emit('iam', { type });
    socket.emit('join', room, ({ success, msg }) => {
      console.log({ success, msg });
    });
  };

  const leaveRoom = () => {
    socket.emit('leave');
  };

  const sendCommand = () => {
    const command = commandRef.current?.value;
    const payload = JSON.parse(payloadRef.current?.value ?? '{}');
    if (!command) return;

    socket.emit('command', { ...payload, type: command });
  };

  const setPayload = (command: string) => {
    if (!payloadRef.current || payloadRef.current.value != '') return;

    if (command === 'image:txt2img') {
      payloadRef.current.value = JSON.stringify(
        {
          id: 'image:test',
          quantity: 1,
          batchSize: 1,
          model: '64b14b6ca5',
          vae: 'c6a580b13a5bc05a5e16e4dbb80608ff2ec251a162311590c1f34c013d7f3dab',
          params: {
            prompt: 'masterpiece, best quality, female mouse, realistic, argyle dress <lora:GPTS3 animals_258424:1>',
            negativePrompt:
              'cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)), ((poorly drawn)), ((extra limbs)), ((close up)), ((b&w)), weird colors, blurry',
            sampler: 'DPM++ 2M Karras',
            width: 512,
            height: 704,
            cfgScale: 7,
            steps: 12,
            seed: -1,
            clipSkip: 2,
          },
        },
        null,
        2,
      );
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', width: 400, margin: '0 auto' }}>
        {isConnected ? <h1>Connected</h1> : <h1>Disconnected</h1>}
        {!isReady ? (
          <>
            <select ref={typeRef}>
              <option value="client">Client</option>
              <option value="sd">Server</option>
            </select>
            <input ref={roomRef} />
            <button onClick={joinRoom}>Join</button>
          </>
        ) : (
          <>
            <h2>{clientType}</h2>
            <select ref={commandRef} onChange={(e) => setPayload(e.target.value)}>
              <option value="resources:list">List Resources</option>
              <option value="resources:add">Add Resource</option>
              <option value="resources:add:cancel">Cancel Add Resource</option>
              <option value="resources:remove">Remove Resource</option>
              <option value="image:txt2img">Generate Image</option>
            </select>
            <textarea ref={payloadRef} rows={20} />
            <button onClick={sendCommand}>Send</button>
            <button onClick={leaveRoom}>Leave</button>
            <div ref={imgOutRef} />
          </>
        )}
      </div>
    </>
  );
};

export default Home;
