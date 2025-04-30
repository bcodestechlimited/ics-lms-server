import { NextFunction, Request, Response } from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export function uploadFile(req: Request, res: Response, next: NextFunction) {
  upload.single("courseImage")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: `File upload failed: ${err.message}` });
    }
    if (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({ message: `An unknown error occurred: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    next();
  });
}

export function uploadCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("certificate")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: `File upload failed: ${err.message}` });
    }
    if (err) {
      return res
        .status(500)
        .json({ message: `An unknown error occurred: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    next();
  });
}
