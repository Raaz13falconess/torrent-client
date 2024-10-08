const dgram = require('dgram');
const url = require('url');

// Function to build the UDP connect request to the tracker
function buildConnectRequest() {
    const buf = Buffer.alloc(16);
    buf.writeUInt32BE(0x417, 0); // Protocol ID
    buf.writeUInt32BE(0x27101980, 4);
    buf.writeUInt32BE(0, 8); // Action (connect)
    buf.writeUInt32BE(Math.floor(Math.random() * 1000000), 12); // Transaction ID
    return buf;
}

// Function to build the UDP announce request to the tracker
function buildAnnounceRequest(connectionId, infoHash, peerId) {
    const buf = Buffer.alloc(98);
    connectionId.copy(buf, 0);
    buf.writeUInt32BE(1, 8); // Action (announce)
    buf.writeUInt32BE(Math.floor(Math.random() * 1000000), 12); // Transaction ID
    infoHash.copy(buf, 16); // Info hash
    peerId.copy(buf, 36); // Peer ID
    buf.writeBigUInt64BE(0n, 56); // Downloaded
    buf.writeBigUInt64BE(0n, 64); // Left
    buf.writeBigUInt64BE(0n, 72); // Uploaded
    buf.writeUInt32BE(0, 80); // Event (0 for none)
    buf.writeUInt32BE(0, 84); // IP address (0 for default)
    buf.writeUInt32BE(0, 88); // Key
    buf.writeInt32BE(-1, 92); // Num want (-1 for default)
    buf.writeUInt16BE(6881, 96); // Port
    return buf;
}

// Function to parse peer list from tracker response
function parsePeerList(response) {
    const peers = [];
    for (let i = 20; i < response.length; i += 6) {
        const ip = response.slice(i, i + 4).join('.');
        const port = response.readUInt16BE(i + 4);
        peers.push({ ip, port });
    }
    return peers;
}

// Function to request peer list from the tracker
function requestPeerList(client, connectionId, torrent, peerId) {
    const announceReq = buildAnnounceRequest(connectionId, torrent.infoHash, peerId);
    console.log('Sending announce request to tracker...');
    client.send(announceReq, 0, announceReq.length, 6881, torrent.trackerUrl);
}

// Connect to the tracker and fetch peer list
function connectToTracker(trackerUrl, infoHash, peerId, callback) {
    const client = dgram.createSocket('udp4');
    const request = buildConnectRequest();

    const parsedTrackerUrl = url.parse(trackerUrl);
    const port = parsedTrackerUrl.port || 6881;
    const hostname = parsedTrackerUrl.hostname;

    console.log('Sending connect request to tracker...');
    client.send(request, 0, request.length, port, hostname);

    client.on('message', (msg) => {
        const action = msg.readUInt32BE(0);

        if (action === 0) { // Action = 0 means a connect response
            const connectionId = msg.slice(8, 16); // Extract connection ID
            console.log('Received connection ID from tracker:', connectionId.toString('hex'));

            // Request peer list using the connection ID
            requestPeerList(client, connectionId, { infoHash, trackerUrl }, peerId);
        }

        if (action === 1) { // Action = 1 means an announce response (peer list)
            console.log('Received peer list from tracker.');
            const peers = parsePeerList(msg);
            callback(peers); // Send peers list to the callback
        }
    });

    client.on('error', (err) => {
        console.error('Error in tracker communication:', err);
        client.close();
    });

    client.on('close', () => {
        console.log('UDP client closed.');
    });
}

module.exports = connectToTracker;
