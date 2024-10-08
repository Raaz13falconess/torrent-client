function requestPiece(socket, pieceIndex, blockOffset, blockLength) {
    // Buffer of 17 bytes: 13 for the actual request and 4 for the length prefix
    const buf = Buffer.alloc(17);
    
    // Write the length of the message (13 bytes: 1 for message ID + 4 + 4 + 4 for index/offset/length)
    buf.writeUInt32BE(13, 0); 
    
    // Write message ID: 6 for "request"
    buf.writeUInt8(6, 4); 
    
    // Write the piece index (which piece we're requesting from the torrent)
    buf.writeUInt32BE(pieceIndex, 5); 
    
    // Write the block offset (the position within the piece to start reading from)
    buf.writeUInt32BE(blockOffset, 9); 
    
    // Write the block length (the number of bytes we are requesting)
    buf.writeUInt32BE(blockLength, 13); 
    
    // Send the request to the peer via the socket
    console.log(`Requesting pieceIndex: ${pieceIndex}, blockOffset: ${blockOffset}, blockLength: ${blockLength}`);
    socket.write(buf);
}

module.exports = requestPiece;
