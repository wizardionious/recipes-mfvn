import type { Types } from "mongoose";

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocumentWithoutUpdate {
  _id: Types.ObjectId;
  createdAt: Date;
}
