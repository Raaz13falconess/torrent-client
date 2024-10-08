const net = require('net');
const { buildHandshake } = require('../../utils/handshake');

function connectToPeer(peer, infoHash, peerId) {
    const socket = new net.Socket();

    // Connect to the peer's IP and port
    socket.connect(peer.port, peer.ip, () => {
        console.log(`Connected to peer: ${peer.ip}:${peer.port}`);

        // Build and send the handshake message
        const handshake = buildHandshake(infoHash, peerId);
        socket.write(handshake);
    });

    // Handle data received from the peer
    socket.on('data', (data) => {
        console.log(`Received data from ${peer.ip}:${peer.port}`);
        handlePeerData(socket, data, peer);  // Parse and handle the received data
    });

    // Handle connection error
    socket.on('error', (err) => {
        console.error(`Error connecting to peer: ${peer.ip}:${peer.port}`, err);
    });

    // Handle connection closure
    socket.on('close', () => {
        console.log(`Connection to ${peer.ip}:${peer.port} closed.`);
    });
}

// Function to handle incoming data from the peer (can be expanded as needed)
function handlePeerData(socket, data, peer) {
    // For example, parse the handshake response from the peer
    console.log('Handshake or message from peer:', data);

    // You would typically parse the peer's response here and respond accordingly
    // For example, after a successful handshake, you would send interested/uninterested messages, etc.
}

module.exports = connectToPeer;
