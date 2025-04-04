import DataURIParser from "datauri/parser";

import path from "path";
interface UploadedFile {
  originalname: string; // e.g., "image.png"
  buffer: Buffer; // binary data of the file
}

const getDataUri = (file: UploadedFile) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getDataUri;
