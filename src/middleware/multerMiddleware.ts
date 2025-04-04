import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("profilePicture");
export const arrayUpload = multer({ storage }).array("images", 10);
