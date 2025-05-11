"use server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const deleteUTFiles = async (fileKey: string) => {
  try {
    await utapi.deleteFiles(fileKey);
  } catch (error) {
    console.error("UTAPI: Error deleting files", error);
  }
};
