import { db } from "./database"

export const apiGet = async (query: string) => {
  return await new Promise((resolve, reject) => {
    db.all(query, (error: Error, row: any) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      return resolve(row);
    });
  });
};

export const apiPost = async (query: string, values: string[]) => {
  return await new Promise((resolve, reject) => {
    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        reject(error);
      }
      return resolve(null);
    });
  });
};

export const apiPatch = async (query: string, values: string[]) => { // TODO: might not want values to be type string because some fields are numbers
  return await new Promise((resolve, reject) => {
    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        reject(error);
      }
      return resolve( { changes: this.changes });
    });
  });
};

// same as above, would combine but maybe better to keep separate for clarity
export const apiDelete = async (query: string, values: string[]) => {
  return await new Promise((resolve, reject) => {
    db.run(query, values, function (error) {
      if (error) {
        console.log(error);
        reject(error);
      }
      return resolve( { changes: this.changes });
    });
  });
};