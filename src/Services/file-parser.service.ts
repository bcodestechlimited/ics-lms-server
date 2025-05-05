import {Readable} from "stream";
import fs from "fs/promises";
import csv from "csv-parser";
import xlsx from "xlsx";
import {UploadedFile} from "express-fileupload";

export interface ParsedUser {
  firstname: string;
  lastname: string;
  email: string;
}

export class FileParserService {
  public async parseCsv(file: UploadedFile): Promise<ParsedUser[]> {
    const results: ParsedUser[] = [];

    // load buffer either from memory or from tempFilePath
    let buffer: Buffer;
    if (file.data && file.data.length > 0) {
      buffer = file.data;
    } else if (file.tempFilePath) {
      buffer = await fs.readFile(file.tempFilePath);
    } else {
      throw new Error("No file data available");
    }

    const mime = file.mimetype;

    // CSV
    if (mime === "text/csv" || mime === "application/vnd.ms-excel") {
      return new Promise((resolve, reject) => {
        Readable.from(buffer)
          .pipe(csv())
          .on("data", (row: any) => {
            const {firstname, lastname, email} = row;
            if (firstname && lastname && email) {
              results.push({firstname, lastname, email});
            }
          })
          .on("end", () => resolve(results))
          .on("error", (err) => reject(err));
      });
    }

    // Excel
    if (
      mime ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mime === "application/vnd.ms-excel"
    ) {
      const workbook = xlsx.read(buffer, {type: "buffer"});
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

      for (const row of jsonData) {
        const {firstname, lastname, email} = row as Record<string, string>;
        if (firstname && lastname && email) {
          results.push({firstname, lastname, email});
        }
      }
      return results;
    }

    throw new Error("Unsupported file type: " + mime);
  }
}

export const fileParserService = new FileParserService();
