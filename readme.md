# BitTorrent Client in Node.js

## Overview
This project implements a basic BitTorrent client using Node.js. It covers core functionalities such as parsing `.torrent` files, connecting to a tracker, discovering peers, requesting pieces, and assembling the file from downloaded pieces.

### Features:
- Parses `.torrent` files to extract metadata such as `infoHash`, piece length, and announce URL.
- Connects to the tracker via UDP to fetch a list of peers participating in the torrent swarm.
- Establishes TCP connections to peers for downloading pieces.
- Requests pieces from peers and reassembles them into the final file.
- Supports writing the final file to disk once all pieces are downloaded.

### Core Modules:
1. **Torrent Parsing** (`parseTorrent.js`): Extracts metadata such as `infoHash`, announce URL, piece length, and total length from the `.torrent` file.
2. **Tracker Communication** (`tracker.js`): Sends requests to the tracker and handles the response to get a list of peers.
3. **Peer Connection** (`peer.js`): Connects to peers via TCP and manages the handshake and data transfer.
4. **Piece Requesting** (`download.js`): Manages piece requests by specifying piece index, block offset, and block length.
5. **File Assembly** (`assemble.js`): Reassembles the downloaded pieces and writes the final file to disk.

### File Structure:
```plaintext
.
├── src
│   ├── torrent
│   │   ├── parseTorrent.js       # Parses .torrent file
│   │   ├── tracker.js            # Connects to tracker and fetches peers
│   │   ├── peer.js               # Connects to a peer and handles data exchange
│   │   ├── download.js           # Sends requests for specific pieces of the file
│   │   └── assemble.js           # Assembles the final file from downloaded pieces
│   └── utils
│       ├── handshake.js          # Builds handshake message for peer connection
│       └── message.js            # Helper functions for building and parsing messages
├── big-buck-bunny.torrent        # Example .torrent file
└── index.js                      # Main entry point
```

---

## How to Run

### Prerequisites:
- **Node.js**: Make sure you have Node.js installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).

### Installation:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bittorrent-client.git
   cd bittorrent-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Place a valid `.torrent` file (e.g., `big-buck-bunny.torrent`) in the root directory.

### Running the Client:
To start the BitTorrent client, run:

```bash
node index.js
```

This will:
1. Parse the `.torrent` file to get metadata.
2. Connect to the tracker to retrieve a list of peers.
3. Establish connections to peers, request pieces, and download the file.
4. Assemble the downloaded pieces into a complete file.

You will see logs in the console for each step, including:
- Number of peers discovered.
- Connections established with peers.
- Piece requests and completions.
- Final file assembly.

---

## Example Output

```bash
Peers discovered: 15
Connected to peer: 192.168.1.5:6881
Requesting piece 0
Writing piece 1 of 120
...
Piece 119 complete
All pieces downloaded. Assembling file...
File assembly complete: big-buck-bunny.mp4
```

---
---

## Future Modifications

In the future, we aim to enhance the functionality and efficiency of this BitTorrent client by implementing the following algorithms:

### 1. **Choking and Unchoking Algorithm**
   - Currently, the client requests pieces without considering peer choking states.
   - We will implement the BitTorrent choking algorithm where peers choke (deny service to) each other based on download speed and available bandwidth. This ensures efficient peer-to-peer communication and prevents poor-performing peers from wasting resources.

### 2. **Optimized Piece Selection Algorithm**
   - Currently, pieces are requested sequentially without prioritization.
   - We plan to implement smarter piece selection algorithms like:
     - **Rarest First**: Prioritizes pieces that have the fewest copies in the swarm, improving the overall health of the torrent swarm.
     - **Endgame Mode**: When there are only a few pieces left to download, request all of them from multiple peers to reduce download time and avoid idle waiting.
     - **Random First Piece**: Requests random pieces to minimize waiting time for rare pieces, ensuring the download process doesn't stall.

### 3. **Parallel Piece Downloading**
   - Currently, piece downloading happens one-by-one for each peer connection.
   - We will implement parallel downloading, where multiple peers contribute simultaneously to downloading different parts of the same piece. This speeds up the overall download process.
