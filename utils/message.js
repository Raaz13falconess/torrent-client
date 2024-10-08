// Message IDs for different actions
const MESSAGE_ID = {
    CHOKE: 0,
    UNCHOKE: 1,
    INTERESTED: 2,
    NOT_INTERESTED: 3,
    HAVE: 4,
    BITFIELD: 5,
    REQUEST: 6,
    PIECE: 7,
    CANCEL: 8
};

// Function to build a 'request' message to ask a peer for a specific block of a piece
function buildRequestMessage(pieceIndex, begin, length) {
    const buf = Buffer.alloc(17);
    buf.writeUInt32BE(13, 0);         // Message length
    buf.writeUInt8(MESSAGE_ID.REQUEST, 4); // Message ID
    buf.writeUInt32BE(pieceIndex, 5);  // Piece index
    buf.writeUInt32BE(begin, 9);       // Block start position in the piece
    buf.writeUInt32BE(length, 13);     // Block length
    return buf;
}

// Function to build an 'interested' message to notify the peer
function buildInterestedMessage() {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);             // Message length
    buf.writeUInt8(MESSAGE_ID.INTERESTED, 4);  // Message ID
    return buf;
}

// Function to parse incoming messages from peers
function parseMessage(message) {
    const messageLength = message.readUInt32BE(0);
    const messageId = message.length > 4 ? message.readUInt8(4) : null;

    if (messageId === MESSAGE_ID.PIECE) {
        const pieceIndex = message.readUInt32BE(5);
        const blockOffset = message.readUInt32BE(9);
        const block = message.slice(13);
        return {
            id: MESSAGE_ID.PIECE,
            pieceIndex,
            blockOffset,
            block,
        };
    }

    return { id: messageId, length: messageLength };
}

module.exports = {
    buildRequestMessage,
    buildInterestedMessage,
    parseMessage,
    MESSAGE_ID
};
