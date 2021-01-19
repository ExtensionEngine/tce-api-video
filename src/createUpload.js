import axios from 'axios';

const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB

export default function upload({ url, file, videoId }) {
  const { size } = file;
  if (CHUNK_SIZE > file.size) return post({ url, videoId, chunk: file });
  const chunks = createChunks(file);
  return Promise.all(chunks.map(it => post({ url, videoId, size, ...it })));
}

function createChunks(file) {
  const chunks = [];
  const { size } = file;
  for (let offset = 0; offset < size; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, size);
    const chunk = file.slice(offset, end);
    chunks.push({ chunk, offset, end });
  }
  return chunks;
}

function post({ url, videoId, chunk, size, offset, end }) {
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  if (offset !== undefined && end !== undefined) {
    headers['Content-Range'] = `bytes ${offset}-${end - 1}/${size}`;
  }
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('videoId', videoId);
  return axios.post(url, formData, { headers });
}
