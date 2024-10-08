const fs = require('fs');

function assembleFile(pieces, fileName) {
    // Create a write stream for the output file
    const file = fs.createWriteStream(fileName);
    
    // Write each piece sequentially into the file
    pieces.forEach((piece, index) => {
        console.log(`Writing piece ${index + 1} of ${pieces.length}`);
        file.write(piece);
    });
    
    // Finalize the file once all pieces are written
    file.end(() => {
        console.log(`File assembly complete: ${fileName}`);
    });
}

module.exports = assembleFile;
