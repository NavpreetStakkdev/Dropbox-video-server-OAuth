function createFileChunks(file, chunkSize) {
    const chunks = [];
    let offset = 0;
  
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.path);
  
      readStream.on('data', (chunk) => {
        chunks.push({ data: chunk, offset });
        offset += chunk.length;
      });
  
      readStream.on('end', () => {
        resolve(chunks);
      });
  
      readStream.on('error', (error) => {
        reject(error);
      });
    });
  }

module.exports.createFileChunks