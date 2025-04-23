import csv from "csv-parser";
import {Readable} from "node:stream";
import * as xlsx from "xlsx";

interface ParsedUser {
  firstname: string;
  lastname: string;
  email: string;
}

class FileParserService {
  public async parseCsv(file: Express.Multer.File): Promise<ParsedUser[]> {
    const results: ParsedUser[] = [];

    const mimeType = file.mimetype;
    const buffer = file.buffer;

    if (mimeType === "text/csv") {
      return new Promise((resolve, reject) => {
        Readable.from(buffer)
          .pipe(csv())
          .on("data", (data) => {
            const {firstname, lastname, email} = data;
            if (firstname && lastname && email) {
              results.push({
                firstname: firstname,
                lastname: lastname,
                email: email,
              });
            }
          })
          .on("end", () => resolve(results))
          .on("error", (error) => reject(error));
      });
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      const workbook = xlsx.read(buffer, {type: "buffer"});
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);

      for (const row of jsonData) {
        const {firstname, lastname, email} = row as Record<string, string>;
        if (firstname && lastname && email) {
          results.push({firstname: firstname, lastname, email});
        }
      }

      return results;
    }

    throw new Error("Unsupported file type");
  }
}

export const fileParserService = new FileParserService();
export default FileParserService;
