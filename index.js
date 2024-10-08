const parseTorrent = require('./src/torrent/parseTorrent');
const connectToTracker = require('./src/torrent/tracker');
const connectToPeer = require('./src/torrent/peer');
const requestPiece = require('./src/torrent/download');
const assembleFile = require('./src/torrent/assemble');
const { buildInterestedMessage, parseMessage } = require('./utils/message');
const { buildHandshake } = require('./utils/handshake');

const torrentFile = './big-buck-bunny.torrent';
const peerId = Buffer.alloc(20, '01234567890123456789');
const requestedPieces = new Set(); // Keep track of requested pieces
const receivedPieces = {}; // Store received pieces
let totalPieces = 0;

function startTorrentDownload() {
    console.log('Starting torrent download...');
    // Step 1: Parse torrent file to get the information needed
    const torrent = parseTorrent(torrentFile);
    console.log('Torrent parsed:', torrent);

    // Step 2: Connect to the tracker to get peer list
    console.log('Connecting to tracker...');
    connectToTracker(torrent.announce, torrent.infoHash, peerId, (peers) => {
        console.log(`Peers discovered: ${peers.length}`);
        
        // Step 3: For each peer, connect and start downloading pieces
        peers.forEach((peer) => {
            console.log('Connecting to peer:', peer);
            connectToPeer(peer, torrent.infoHash, peerId, (socket) => {
                console.log('Connected to peer:', peer);
                onPeerConnected(socket, torrent);
            });
        });
    });
}

function onPeerConnected(socket, torrent) {
    console.log('Connected to a peer, sending interested message...');
    // Send interested message to the peer
    const interested = buildInterestedMessage();
    socket.write(interested);

    // Listen for incoming messages from the peer
    socket.on('data', (data) => {
        const message = parseMessage(data);
        console.log('Received message:', message);

        if (message.id === 1) {
            // Peer unchoked us, we can request pieces now
            console.log('Peer unchoked us, requesting pieces...');
            requestPieces(socket, torrent);
        }

        if (message.id === 7) {
            // Received a piece of data
            console.log('Received piece data...');
            handlePieceData(message, torrent, socket);
        }
    });
}

function requestPieces(socket, torrent) {
    console.log('Requesting pieces from peer...');
    // Request each piece one by one
    const totalPieces = torrent.pieces.length / 20; // Each SHA-1 hash is 20 bytes
    for (let i = 0; i < totalPieces; i++) {
        if (!requestedPieces.has(i)) {
            requestedPieces.add(i);
            const pieceLength = torrent.pieceLength;
            const pieceIndex = i;
            const blockOffset = 0;
            const blockLength = Math.min(16384, pieceLength); // 16 KB block size

            console.log(`Requesting piece ${i}`);
            requestPiece(socket, pieceIndex, blockOffset, blockLength);
        }
    }
}

function handlePieceData(message, torrent, socket) {
    const { pieceIndex, blockOffset, block } = message;

    if (!receivedPieces[pieceIndex]) {
        receivedPieces[pieceIndex] = Buffer.alloc(torrent.pieceLength);
        console.log(`Allocated buffer for piece ${pieceIndex}`);
    }

    block.copy(receivedPieces[pieceIndex], blockOffset);
    console.log(`Received block for piece ${pieceIndex} at offset ${blockOffset}`);

    const isPieceComplete = checkPieceCompletion(pieceIndex, torrent);
    if (isPieceComplete) {
        console.log(`Piece ${pieceIndex} complete`);
        // Check if we have downloaded all pieces
        totalPieces++;
        console.log(`Total pieces completed: ${totalPieces}/${torrent.pieces.length / 20}`);
        
        if (totalPieces === torrent.pieces.length / 20) {
            console.log('All pieces downloaded. Assembling file...');
            assembleFile(Object.values(receivedPieces), torrent.name);
        } else {
            console.log('Requesting next pieces...');
            requestPieces(socket, torrent); // Request next piece
        }
    }
}

function checkPieceCompletion(pieceIndex, torrent) {
    // Check if the entire piece has been downloaded
    const pieceLength = torrent.pieceLength;
    const lastBlock = receivedPieces[pieceIndex][pieceLength - 1];
    console.log(`Checking if piece ${pieceIndex} is complete...`);

    return !!lastBlock; // Return true if the last block is filled
}

startTorrentDownload();
