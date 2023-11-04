# GraphQl query builder with TS type support

## Installation

```bash
npm install --save graphql-query-builder-ts
```

## Getting started

After install run:

```bash
npm exec graphql-query-builder-ts -- --init
```

Every time your schema changes run:

```bash
npm exec graphql-query-builder-ts -- --update
```

## Usage

Simple usage:

```typescript
import queryBuilder from "graphql-query-builder-ts";

const query = queryBuilder("query", {
  menu: {
    args: {
      _id: "654321",
    },
    fields: ["_id", { products: ["_id"] }],
  },
});
```

Multiple or the same query/mutation:

```typescript
import queryBuilder from "graphql-query-builder-ts";

const query = queryBuilder("query", {
  menu: [
    {
      alias: "menu1",
      args: {
        _id: "654321",
      },
      fields: ["_id", { products: ["_id"] }],
    },
    {
      alias: "menu2",
      args: {
        _id: "654321",
      },
      fields: ["_id", { products: ["_id"] }],
    },
  ],
});
```
