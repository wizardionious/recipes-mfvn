import { EventEmitter } from "node:events";

export type DomainEvents = {
  "recipe:created": { recipeId: string };
  "recipe:updated": { recipeId: string };
  "recipe:deleted": { recipeId: string };

  "category:created": { categoryId: string };
  "category:deleted": { categoryId: string };

  "comment:created": {
    recipeId: string;
    commentId: string;
  };
  "comment:deleted": {
    recipeId: string;
    commentId: string;
  };

  "favorite:created": { recipeId: string; userId: string };
  "favorite:deleted": { recipeId: string; userId: string };

  "recipe-rating:created": {
    recipeId: string;
    userId: string;
    value: number;
  };
  "recipe-rating:updated": {
    recipeId: string;
    userId: string;
    previousValue: number | null;
    value: number;
  };
  "recipe-rating:deleted": {
    recipeId: string;
    userId: string;
    value: number;
  };
};

export type DomainEventHandler<K extends keyof DomainEvents> = (
  args: DomainEvents[K],
) => void;

export interface TypedEmitter extends EventEmitter {
  on<K extends keyof DomainEvents>(
    event: K,
    listener: DomainEventHandler<K>,
  ): this;
  off<K extends keyof DomainEvents>(
    event: K,
    listener: DomainEventHandler<K>,
  ): this;
  once<K extends keyof DomainEvents>(
    event: K,
    listener: DomainEventHandler<K>,
  ): this;
  emit<K extends keyof DomainEvents>(event: K, args: DomainEvents[K]): boolean;
  removeAllListeners<K extends keyof DomainEvents>(event?: K): this;
}

export function createEventBus(): TypedEmitter {
  return new EventEmitter() as TypedEmitter;
}
