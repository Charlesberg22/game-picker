import { db } from "./database"

export const dbAll = async (query: string, values?: string[]) => {
  return await new Promise((resolve, reject) => {
    db.all(query, values,  (error: Error, row: any) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      return resolve(row);
    });
  });
};

export const dbGet = async (query: string, values?: string[]) => {
  return await new Promise((resolve, reject) => {
    db.get(query, values,  (error: Error, row: any) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      return resolve(row);
    });
  });
};

export const dbRun = async (query: string, values: string[]) => {
  return await new Promise((resolve, reject) => {
    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        reject(error);
      }
      return resolve(this);
    });
  });
};