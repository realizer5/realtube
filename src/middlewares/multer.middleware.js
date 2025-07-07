import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function(req, file, cb) { cb(null, "./public/temp") },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + uniqueSuffix + originalExtension);
    },
});

export const upload = multer({ storage });
