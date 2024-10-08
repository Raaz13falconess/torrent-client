const fs = require('fs');
const bencode = require('bncode');
const crypto = require('crypto');

function parseTorrent(filePath) {
    console.log(`Reading torrent file from: ${filePath}`);

    try {
        const torrentData = fs.readFileSync(filePath);
        console.log('Torrent file read successfully.');

        const torrent = bencode.decode(torrentData);
        console.log('Torrent data decoded using bencode:', torrent);

        const infoHash = crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest();
        console.log('Info hash generated:', infoHash.toString('hex'));

        const torrentInfo = {
            infoHash: infoHash,
            announce: torrent.announce.toString(),
            pieceLength: torrent.info['piece length'],
            pieces: torrent.info.pieces,
            length: torrent.info.length,
            name: torrent.info.name.toString(),
        };

        console.log('Torrent info extracted:', torrentInfo);
        return torrentInfo;
    } catch (error) {
        console.error('Error parsing torrent file:', error);
        throw error;
    }
}

module.exports = parseTorrent;
