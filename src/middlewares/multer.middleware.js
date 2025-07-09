import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function(_req, _file, cb) { cb(null, "./public/temp") },
    filename: function(_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const index = file.originalname.lastIndexOf(".");
        const newName = file.originalname.slice(0, index) + "-" + uniqueSuffix +
            file.originalname.slice(index);
        cb(null, newName);
    },
});

export const upload = multer({ storage });
