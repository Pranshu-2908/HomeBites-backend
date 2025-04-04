import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("image");
export const arrayUpload = multer({ storage }).array("images", 10);
