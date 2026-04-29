import type { Prettify } from "@recipes/shared";
import type {
  Model,
  PipelineStage,
  PopulateOptions,
  QueryFilter,
  QueryOptions,
  Types,
} from "mongoose";
import type { RefKeys } from "@/common/types/mongoose.js";

export type Merge<A, B> = Prettify<Omit<A, keyof B> & B>;
export type PopulateKeys<T> = Partial<Prettify<Record<RefKeys<T>, unknown>>>;

export type TimestampKeys = "createdAt" | "updatedAt";
export type AutoFields = "_id" | TimestampKeys;

export type RepositoryPopulate = PopulateOptions | PopulateOptions[];
export type RepositoryQueryOptions = Omit<QueryOptions, "populate"> & {
  populate?: RepositoryPopulate;
};

export type RefsForInput<T> = Prettify<
  Omit<T, RefKeys<T>> & {
    [K in RefKeys<T>]: T[K] extends readonly Types.ObjectId[]
      ? readonly (Types.ObjectId | string)[]
      : T[K] extends Types.ObjectId
        ? Types.ObjectId | string
        : T[K];
  }
>;
export type CreateInput<T extends { _id: Types.ObjectId }> = Partial<
  RefsForInput<T>
>;
export type UpdateInput<T extends { _id: Types.ObjectId }> = Partial<
  Omit<RefsForInput<T>, "_id">
>;

export class BaseRepository<
  TDoc extends { _id: Types.ObjectId },
  TCreate extends CreateInput<TDoc> = CreateInput<TDoc>,
  TUpdate extends UpdateInput<TDoc> = UpdateInput<TDoc>,
  // biome-ignore lint/complexity/noBannedTypes: default object value
  TDefaultPopulate extends PopulateKeys<TDoc> = {},
> {
  protected readonly model: Model<TDoc>;

  constructor(model: Model<TDoc>) {
    this.model = model;
  }

  async findById<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    id: string,
    options: RepositoryQueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const { queryOptions, populate } = this.resolveOptions(options);
    const query = this.model.findById(id, null, queryOptions);

    if (populate) {
      query.populate<TPopulate>(populate);
    }

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  async findOne<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    filter: QueryFilter<TDoc>,
    options: RepositoryQueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const { queryOptions, populate } = this.resolveOptions(options);
    const query = this.model.findOne(filter, null, queryOptions);

    if (populate) {
      query.populate<TPopulate>(populate);
    }

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  async find<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    filter: QueryFilter<TDoc> = {},
    options: RepositoryQueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate>[]> {
    const { queryOptions, populate } = this.resolveOptions(options);
    const query = this.model.find(filter, null, queryOptions);

    if (populate) {
      query.populate<TPopulate>(populate);
    }

    return query.lean<Merge<TDoc, TPopulate>[]>();
  }

  async create<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    data: TCreate,
    options: { populate?: RepositoryPopulate } = {},
  ): Promise<Merge<TDoc, TPopulate>> {
    const populate = this.mergePopulate(options.populate);
    const doc = await this.model.create(this.castInput(data));

    if (populate) {
      await doc.populate<TPopulate>(populate);
    }

    return doc.toObject<Merge<TDoc, TPopulate>>();
  }

  async update<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    id: string,
    data: TUpdate,
    options: RepositoryQueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const { queryOptions, populate } = this.resolveOptions(options);
    const query = this.model.findByIdAndUpdate(id, this.castInput(data), {
      returnDocument: "after",
      runValidators: true,
      ...queryOptions,
    });

    if (populate) {
      query.populate<TPopulate>(populate);
    }

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  /**
   * Deletes a document by id or filter.
   *
   * @param filter - The filter to use for finding the document to delete.
   * @param options - The options to use for the delete operation.
   * @returns The deleted document, or null if no document was found.
   */
  async delete<TPopulate extends PopulateKeys<TDoc> = TDefaultPopulate>(
    filter: string | QueryFilter<TDoc>,
    options: RepositoryQueryOptions = {},
  ): Promise<Merge<TDoc, TPopulate> | null> {
    const { queryOptions, populate } = this.resolveOptions(options);

    const query =
      typeof filter === "string"
        ? this.model.findByIdAndDelete(filter, queryOptions)
        : this.model.findOneAndDelete(filter, queryOptions);

    if (populate) {
      query.populate<TPopulate>(populate);
    }

    return query.lean<Merge<TDoc, TPopulate>>();
  }

  async exists(filter: QueryFilter<TDoc>): Promise<boolean> {
    return !!(await this.model.exists(filter));
  }

  async count(filter: QueryFilter<TDoc> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async aggregate<TResult = TDoc>(
    pipeline: PipelineStage[],
  ): Promise<TResult[]> {
    return this.model.aggregate<TResult>(pipeline);
  }

  protected castInput<TInput extends Record<string, unknown>>(
    data: TInput,
  ): Partial<TDoc> {
    return this.model.castObject(data) as Partial<TDoc>;
  }

  protected getDefaultPopulate(): RepositoryPopulate | undefined {
    return undefined;
  }

  protected mergePopulate(
    populate?: RepositoryPopulate,
  ): RepositoryPopulate | undefined {
    return populate ?? this.getDefaultPopulate();
  }

  protected resolveOptions(options: RepositoryQueryOptions = {}): {
    queryOptions: Omit<RepositoryQueryOptions, "populate">;
    populate?: RepositoryPopulate;
  } {
    const { populate, ...queryOptions } = options;

    return {
      queryOptions,
      populate: this.mergePopulate(populate),
    };
  }
}
