function buildHandshake(infoHash, peerId) {
    const buf = Buffer.alloc(68);
    buf.writeUInt8(19, 0);
    buf.write('BitTorrent protocol', 1);
    buf.writeUInt32BE(0x0, 20);
    buf.writeUInt32BE(0x0, 24);
    infoHash.copy(buf, 28);
    peerId.copy(buf, 48);
    return buf;
}

module.exports = { buildHandshake };
