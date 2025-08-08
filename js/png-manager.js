// --- PNG metadata helpers (pure JS) ---
const __enc = new TextEncoder(), __dec = new TextDecoder("utf-8");

function __u32BE(n){ const b=new Uint8Array(4); b[0]=(n>>>24)&255; b[1]=(n>>>16)&255; b[2]=(n>>>8)&255; b[3]=n&255; return b; }
function __readU32BE(u8,i){ return ((u8[i]<<24)|(u8[i+1]<<16)|(u8[i+2]<<8)|u8[i+3])>>>0; }
function __concat(...arrs){ const len=arrs.reduce((a,b)=>a+b.length,0); const out=new Uint8Array(len); let off=0; for(const a of arrs){ out.set(a,off); off+=a.length; } return out; }

const __CRC_TABLE = (()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0; } return t; })();
function __crc32(bytes){ let c=0xFFFFFFFF; for(let i=0;i<bytes.length;i++) c=__CRC_TABLE[(c^bytes[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }

function __buildChunk(type, data){
  const typeBytes = new Uint8Array([...type].map(ch=>ch.charCodeAt(0)));
  const crc = __u32BE(__crc32(__concat(typeBytes, data)));
  return __concat(__u32BE(data.length), typeBytes, data, crc);
}

// iTXt = keyword\0 compFlag(0) compMethod(0) lang\0 translated\0 text(utf8)
function __makeITXtChunk(keyword, text){
  const kw = __enc.encode(keyword);
  const txt = __enc.encode(text);
  const z = Uint8Array.of(0);
  const data = __concat(kw, z, Uint8Array.of(0), Uint8Array.of(0), /*lang*/new Uint8Array(0), z, /*translated*/new Uint8Array(0), z, txt);
  return __buildChunk("iTXt", data);
}

function __insertChunkBeforeIEND(pngBytes, chunkBytes){
  const u8 = pngBytes instanceof Uint8Array ? pngBytes : new Uint8Array(pngBytes);
  const SIG = new Uint8Array([137,80,78,71,13,10,26,10]);
  for(let i=0;i<8;i++) if(u8[i]!==SIG[i]) throw new Error("Not a PNG");
  let p=8;
  while(p<u8.length){
    const len = __readU32BE(u8,p);
    const type = String.fromCharCode(u8[p+4],u8[p+5],u8[p+6],u8[p+7]);
    const next = p + 12 + len;
    if(type==="IEND"){
      return __concat(u8.slice(0,p), chunkBytes, u8.slice(p));
    }
    p = next;
  }
  throw new Error("IEND not found");
}

export async function canvasToPngWithMetadata(canvas, key, value){
  const blob = await new Promise(res => {
    if (canvas.toBlob) canvas.toBlob(res, "image/png");
    else {
      // fallback via dataURL
      const dataURL = canvas.toDataURL("image/png");
      const [,b64] = dataURL.split(',');
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i);
      res(new Blob([u8], {type:"image/png"}));
    }
  });
  const ab = await blob.arrayBuffer();
  const chunk = __makeITXtChunk(key, value ?? "");
  const withMeta = __insertChunkBeforeIEND(new Uint8Array(ab), chunk);
  return new Blob([withMeta], { type: "image/png" });
}

export function parsePngMetadata(arrayBuffer, key = "projectMetadata") {
    const u8 = new Uint8Array(arrayBuffer);
    const decUtf8 = new TextDecoder("utf-8");
    const decLatin1 = new TextDecoder("latin1");
    const readU32BE = (arr, i) =>
      ((arr[i] << 24) | (arr[i + 1] << 16) | (arr[i + 2] << 8) | arr[i + 3]) >>> 0;
  
    // PNG signature check
    const SIG = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) {
      if (u8[i] !== SIG[i]) throw new Error("Not a PNG file");
    }
  
    let p = 8;
    while (p + 12 <= u8.length) {
      const length = readU32BE(u8, p);
      const type = String.fromCharCode(u8[p+4], u8[p+5], u8[p+6], u8[p+7]);
      const dataStart = p + 8;
      const dataEnd = dataStart + length;
      const next = dataEnd + 4; // skip CRC
  
      if (dataEnd > u8.length) break; // malformed
  
      if (type === "tEXt") {
        // tEXt = keyword\0 text (Latin-1)
        const data = u8.subarray(dataStart, dataEnd);
        const z = data.indexOf(0);
        if (z > 0) {
          const keyword = decLatin1.decode(data.subarray(0, z));
          if (keyword === key) {
            const value = decLatin1.decode(data.subarray(z + 1));
            try { return JSON.parse(value); } catch { return value; }
          }
        }
      } else if (type === "iTXt") {
        // iTXt = keyword\0 compFlag compMethod language\0 translated\0 text(UTF-8 if compFlag==0)
        const d = u8.subarray(dataStart, dataEnd);
        let i = 0;
        const nextZero = () => {
          const z = d.indexOf(0, i);
          if (z === -1) return null;
          const s = d.subarray(i, z);
          i = z + 1;
          return s;
        };
        const kwBytes = nextZero();
        if (!kwBytes) { p = next; continue; }
        const keyword = decUtf8.decode(kwBytes);
        const compFlag = d[i++]; // 0=uncompressed, 1=compressed
        const compMethod = d[i++]; // must be 0
  
        // skip languageTag and translatedKeyword
        nextZero(); // languageTag
        nextZero(); // translatedKeyword
  
        if (keyword === key) {
          if (compFlag === 0) {
            const value = decUtf8.decode(d.subarray(i));
            try { return JSON.parse(value); } catch { return value; }
          } else {
            console.warn("Found compressed iTXt; inflate needed to read.");
          }
        }
      } else if (type === "IEND") {
        break;
      }
  
      p = next;
    }
  
    return null; // not found
  }
  