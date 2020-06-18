export const humanNIM = (nims: number) => {
  if (nims < 1)
      return `${nims.toFixed(5)} NIM`;

  if (nims < 1e5)
      return `${nims.toFixed(3)} NIM`;

  nims /= 1e6;

  if (nims < 1e3)
      return `${nims.toFixed(2)}m NIM`;

  nims /= 1e3;

  return `${nims.toFixed(0)}b NIM`;
}

export const humanHashes = (bytes: number) => {
  let thresh = 1000;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' H/s';
  }
  let units = ['kH/s','MH/s','GH/s','TH/s','PH/s','EH/s','ZH/s','YH/s'];
  let u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}