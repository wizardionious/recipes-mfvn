import type { HydratedDocument, Model, Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createObjectId } from "@/__tests__/helpers.js";
import type {
  RepositoryPopulate,
  RepositoryQueryOptions,
} from "./base.repository.js";
import { BaseRepository } from "./base.repository.js";

interface TestDoc {
  _id: Types.ObjectId;
  name: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

function createMockQuery(returnValue: unknown = null) {
  return {
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
    exec: vi.fn().mockResolvedValue(returnValue),
  };
}

function createMockModel() {
  return {
    modelName: "TestModel",
    findById: vi.fn().mockImplementation(() => createMockQuery()),
    findOne: vi.fn().mockImplementation(() => createMockQuery()),
    find: vi.fn().mockImplementation(() => createMockQuery()),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn().mockImplementation(() => createMockQuery()),
    findOneAndUpdate: vi.fn().mockImplementation(() => createMockQuery()),
    findByIdAndDelete: vi.fn().mockImplementation(() => createMockQuery()),
    findOneAndDelete: vi.fn().mockImplementation(() => createMockQuery()),
    exists: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
    castObject: vi.fn().mockImplementation((data: unknown) => data),
  };
}

function createMockDoc(
  overrides: Partial<TestDoc> = {},
): HydratedDocument<TestDoc> {
  const doc = {
    _id: createObjectId(),
    name: "Test",
    count: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    toObject: vi.fn().mockReturnValue({ _id: createObjectId(), name: "Test" }),
    populate: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    deleteOne: vi.fn().mockResolvedValue(undefined),
  };
  return doc as unknown as HydratedDocument<TestDoc>;
}

class TestRepository extends BaseRepository<TestDoc> {
  public testCastInput<T extends Record<string, unknown>>(
    data: T,
  ): Partial<TestDoc> {
    return this.castInput(data);
  }

  public testMergePopulate(
    populate?: RepositoryPopulate,
  ): RepositoryPopulate | undefined {
    return this.mergePopulate(populate);
  }

  public testResolveOptions(
    options: RepositoryQueryOptions = {},
  ): ReturnType<BaseRepository<TestDoc>["resolveOptions"]> {
    return this.resolveOptions(options);
  }

  public testGetDefaultPopulate(): RepositoryPopulate | undefined {
    return this.getDefaultPopulate();
  }
}

describe("BaseRepository", () => {
  let mockModel: ReturnType<typeof createMockModel>;
  let repository: TestRepository;

  beforeEach(() => {
    mockModel = createMockModel();
    repository = new TestRepository(mockModel as unknown as Model<TestDoc>);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should store modelName from model", () => {
      expect(repository.modelName).toBe("TestModel");
    });
  });

  describe("findById", () => {
    it("should call model.findById and lean without populate when no options", async () => {
      const id = createObjectId().toHexString();
      const expectedDoc = { _id: id, name: "Doc" };
      const query = createMockQuery(expectedDoc);
      mockModel.findById.mockReturnValue(query);

      const result = await repository.findById(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id, null, {});
      expect(query.populate).not.toHaveBeenCalled();
      expect(query.lean).toHaveBeenCalled();
      expect(result).toEqual(expectedDoc);
    });

    it("should populate when options include populate", async () => {
      const id = createObjectId().toHexString();
      const populate = { path: "author", select: "name" };
      const query = createMockQuery({ _id: id, name: "Doc" });
      mockModel.findById.mockReturnValue(query);

      await repository.findById(id, { populate });

      expect(query.populate).toHaveBeenCalledWith(populate);
    });

    it("should NOT populate when populate is false", async () => {
      const id = createObjectId().toHexString();
      const query = createMockQuery({ _id: id, name: "Doc" });
      mockModel.findById.mockReturnValue(query);

      await repository.findById(id, { populate: false });

      expect(query.populate).not.toHaveBeenCalled();
    });

    it("should pass queryOptions to findById", async () => {
      const id = createObjectId().toHexString();
      const query = createMockQuery(null);
      mockModel.findById.mockReturnValue(query);

      await repository.findById(id, { select: "name" });

      expect(mockModel.findById).toHaveBeenCalledWith(id, null, {
        select: "name",
      });
    });
  });

  describe("findDocumentById", () => {
    it("should return hydrated document via exec", async () => {
      const id = createObjectId().toHexString();
      const expectedDoc = createMockDoc();
      const query = createMockQuery(expectedDoc);
      mockModel.findById.mockReturnValue(query);

      const result = await repository.findDocumentById(id);

      expect(mockModel.findById).toHaveBeenCalledWith(id, null, {});
      expect(query.exec).toHaveBeenCalled();
      expect(result).toBe(expectedDoc);
    });

    it("should populate when options include populate", async () => {
      const id = createObjectId().toHexString();
      const populate = { path: "author" };
      const query = createMockQuery(createMockDoc());
      mockModel.findById.mockReturnValue(query);

      await repository.findDocumentById(id, { populate });

      expect(query.populate).toHaveBeenCalledWith(populate);
    });
  });

  describe("findOne", () => {
    it("should call model.findOne with filter and options", async () => {
      const filter = { name: "test" };
      const expectedDoc = { _id: createObjectId(), name: "test" };
      const query = createMockQuery(expectedDoc);
      mockModel.findOne.mockReturnValue(query);

      const result = await repository.findOne(filter, { select: "name" });

      expect(mockModel.findOne).toHaveBeenCalledWith(filter, null, {
        select: "name",
      });
      expect(result).toEqual(expectedDoc);
    });

    it("should populate when populate option is provided", async () => {
      const query = createMockQuery(null);
      mockModel.findOne.mockReturnValue(query);

      await repository.findOne({}, { populate: { path: "author" } });

      expect(query.populate).toHaveBeenCalledWith({ path: "author" });
    });
  });

  describe("find", () => {
    it("should call model.find with filter and return array", async () => {
      const docs = [
        { _id: createObjectId(), name: "a" },
        { _id: createObjectId(), name: "b" },
      ];
      const query = createMockQuery(docs);
      mockModel.find.mockReturnValue(query);

      const result = await repository.find({ count: { $gt: 0 } });

      expect(mockModel.find).toHaveBeenCalledWith(
        { count: { $gt: 0 } },
        null,
        {},
      );
      expect(result).toEqual(docs);
    });

    it("should use empty filter by default", async () => {
      const query = createMockQuery([]);
      mockModel.find.mockReturnValue(query);

      await repository.find();

      expect(mockModel.find).toHaveBeenCalledWith({}, null, {});
    });

    it("should populate when populate option is provided", async () => {
      const query = createMockQuery([]);
      mockModel.find.mockReturnValue(query);

      await repository.find({}, { populate: { path: "author" } });

      expect(query.populate).toHaveBeenCalledWith({ path: "author" });
    });
  });

  describe("create", () => {
    it("should create document and return toObject result", async () => {
      const data = { name: "New", count: 5 };
      const createdDoc = createMockDoc({ name: "New", count: 5 });
      mockModel.create.mockResolvedValue(createdDoc);

      const result = await repository.create(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(createdDoc.toObject).toHaveBeenCalled();
      expect(result).toEqual(createdDoc.toObject());
    });

    it("should populate document when populate option is provided", async () => {
      const data = { name: "New" };
      const createdDoc = createMockDoc();
      mockModel.create.mockResolvedValue(createdDoc);

      await repository.create(data, { populate: { path: "author" } });

      expect(createdDoc.populate).toHaveBeenCalledWith({ path: "author" });
    });

    it("should cast input data via model.castObject", async () => {
      const data = { name: "New" };
      const casted = { name: "Casted" };
      mockModel.castObject.mockReturnValue(casted);
      const createdDoc = createMockDoc();
      mockModel.create.mockResolvedValue(createdDoc);

      await repository.create(data);

      expect(mockModel.castObject).toHaveBeenCalledWith(data);
      expect(mockModel.create).toHaveBeenCalledWith(casted);
    });
  });

  describe("update", () => {
    it("should use findByIdAndUpdate when filter is a string id", async () => {
      const id = createObjectId().toString();
      const data = { name: "Updated" };
      const updatedDoc = { _id: id, name: "Updated" };
      const query = createMockQuery(updatedDoc);
      mockModel.findByIdAndUpdate.mockReturnValue(query);

      const result = await repository.update(id, data);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        data,
        expect.objectContaining({
          returnDocument: "after",
          runValidators: true,
        }),
      );
      expect(result).toEqual(updatedDoc);
    });

    it("should use findOneAndUpdate when filter is an object", async () => {
      const filter = { name: "test" };
      const data = { count: 10 };
      const updatedDoc = { _id: createObjectId(), count: 10 };
      const query = createMockQuery(updatedDoc);
      mockModel.findOneAndUpdate.mockReturnValue(query);

      const result = await repository.update(filter, data);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        filter,
        data,
        expect.objectContaining({
          returnDocument: "after",
          runValidators: true,
        }),
      );
      expect(result).toEqual(updatedDoc);
    });

    it("should pass queryOptions to update query", async () => {
      const id = createObjectId().toString();
      const query = createMockQuery(null);
      mockModel.findByIdAndUpdate.mockReturnValue(query);

      await repository.update(id, {}, { select: "name" });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        {},
        expect.objectContaining({ select: "name" }),
      );
    });

    it("should populate when populate option is provided", async () => {
      const id = createObjectId().toString();
      const query = createMockQuery(null);
      mockModel.findByIdAndUpdate.mockReturnValue(query);

      await repository.update(id, {}, { populate: { path: "author" } });

      expect(query.populate).toHaveBeenCalledWith({ path: "author" });
    });

    it("should cast input data via model.castObject", async () => {
      const id = createObjectId().toString();
      const data = { name: "Updated" };
      const casted = { name: "Casted" };
      mockModel.castObject.mockReturnValue(casted);
      const query = createMockQuery(null);
      mockModel.findByIdAndUpdate.mockReturnValue(query);

      await repository.update(id, data);

      expect(mockModel.castObject).toHaveBeenCalledWith(data);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        casted,
        expect.anything(),
      );
    });
  });

  describe("delete", () => {
    it("should use findByIdAndDelete when filter is a string id", async () => {
      const id = createObjectId().toString();
      const deletedDoc = { _id: id, name: "Deleted" };
      const query = createMockQuery(deletedDoc);
      mockModel.findByIdAndDelete.mockReturnValue(query);

      const result = await repository.delete(id);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id, {});
      expect(result).toEqual(deletedDoc);
    });

    it("should use findOneAndDelete when filter is an object", async () => {
      const filter = { name: "test" };
      const deletedDoc = { _id: createObjectId(), name: "test" };
      const query = createMockQuery(deletedDoc);
      mockModel.findOneAndDelete.mockReturnValue(query);

      const result = await repository.delete(filter);

      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith(filter, {});
      expect(result).toEqual(deletedDoc);
    });

    it("should populate when populate option is provided", async () => {
      const id = createObjectId().toString();
      const query = createMockQuery(null);
      mockModel.findByIdAndDelete.mockReturnValue(query);

      await repository.delete(id, { populate: { path: "author" } });

      expect(query.populate).toHaveBeenCalledWith({ path: "author" });
    });
  });

  describe("deleteDocument", () => {
    it("should call deleteOne on the document", async () => {
      const doc = createMockDoc();

      await repository.deleteDocument(doc);

      expect(doc.deleteOne).toHaveBeenCalled();
    });
  });

  describe("save", () => {
    it("should save document without data changes", async () => {
      const doc = createMockDoc();

      const result = await repository.save(doc);

      expect(doc.save).toHaveBeenCalled();
      expect(doc.toObject).toHaveBeenCalled();
      expect(result).toEqual(doc.toObject());
    });

    it("should assign casted data and save when data is provided", async () => {
      const doc = createMockDoc();
      const data = { name: "Updated" };
      const casted = { name: "Casted" };
      mockModel.castObject.mockReturnValue(casted);
      vi.spyOn(Object, "assign");

      await repository.save(doc, data);

      expect(mockModel.castObject).toHaveBeenCalledWith(data);
      expect(Object.assign).toHaveBeenCalledWith(doc, casted);
      expect(doc.save).toHaveBeenCalled();
    });

    it("should populate document when populate option is provided", async () => {
      const doc = createMockDoc();

      await repository.save(doc, undefined, { populate: { path: "author" } });

      expect(doc.populate).toHaveBeenCalledWith({ path: "author" });
    });
  });

  describe("exists", () => {
    it("should return true when document exists", async () => {
      mockModel.exists.mockResolvedValue({ _id: createObjectId() });

      const result = await repository.exists({ name: "test" });

      expect(mockModel.exists).toHaveBeenCalledWith({ name: "test" });
      expect(result).toBe(true);
    });

    it("should return false when document does not exist", async () => {
      mockModel.exists.mockResolvedValue(null);

      const result = await repository.exists({ name: "missing" });

      expect(result).toBe(false);
    });
  });

  describe("count", () => {
    it("should delegate to model.countDocuments with filter", async () => {
      mockModel.countDocuments.mockResolvedValue(42);

      const result = await repository.count({ count: { $gt: 0 } });

      expect(mockModel.countDocuments).toHaveBeenCalledWith({
        count: { $gt: 0 },
      });
      expect(result).toBe(42);
    });

    it("should use empty filter by default", async () => {
      mockModel.countDocuments.mockResolvedValue(0);

      await repository.count();

      expect(mockModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe("aggregate", () => {
    it("should delegate to model.aggregate with pipeline", async () => {
      const pipeline = [{ $match: { name: "test" } }];
      mockModel.aggregate.mockResolvedValue([{ _id: "1", name: "test" }]);

      const result = await repository.aggregate(pipeline);

      expect(mockModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(result).toEqual([{ _id: "1", name: "test" }]);
    });
  });

  describe("protected castInput", () => {
    it("should call model.castObject", () => {
      const data = { name: "Test" };
      mockModel.castObject.mockReturnValue({ name: "Casted" });

      const result = repository.testCastInput(data);

      expect(mockModel.castObject).toHaveBeenCalledWith(data);
      expect(result).toEqual({ name: "Casted" });
    });
  });

  describe("protected mergePopulate", () => {
    it("should return undefined when populate is false", () => {
      expect(repository.testMergePopulate(false)).toBeUndefined();
    });

    it("should return provided populate option", () => {
      const populate = { path: "author" };
      expect(repository.testMergePopulate(populate)).toBe(populate);
    });

    it("should return default populate when no option provided", () => {
      expect(repository.testMergePopulate(undefined)).toBeUndefined();
    });
  });

  describe("protected resolveOptions", () => {
    it("should strip populate and lean from options", () => {
      const options = {
        populate: { path: "author" },
        lean: true,
        select: "name",
      };

      const result = repository.testResolveOptions(options);

      expect(result.queryOptions).toEqual({ select: "name" });
      expect(result.populate).toEqual({ path: "author" });
    });

    it("should return empty queryOptions when no options provided", () => {
      const result = repository.testResolveOptions();

      expect(result.queryOptions).toEqual({});
      expect(result.populate).toBeUndefined();
    });

    it("should handle populate: false", () => {
      const result = repository.testResolveOptions({ populate: false });

      expect(result.populate).toBeUndefined();
    });
  });

  describe("default populate", () => {
    it("getDefaultPopulate should return undefined by default", () => {
      expect(repository.testGetDefaultPopulate()).toBeUndefined();
    });
  });
});
