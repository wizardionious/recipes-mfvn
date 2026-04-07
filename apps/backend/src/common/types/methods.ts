export type DefaultQuery = { page: number; limit: number };
export type DefaultInitiator = { initiator: string };

export type QueryMethodParams<
  TQuery = DefaultQuery,
  TInitiator = Partial<DefaultInitiator>,
> = {
  query: TQuery;
} & TInitiator;

export type DeleteMethodParams<TInitiator = DefaultInitiator> = TInitiator;

export type CreateMethodParams<TData, TInitiator = DefaultInitiator> = {
  data: TData;
} & TInitiator;

export type UpdateMethodParams<TData, TInitiator = DefaultInitiator> = {
  data: TData;
} & TInitiator;
