# platziverse-db

## Usage

```js
const setupDatabase = require("platziverse-db");

setupDatabase(config)
  .then((db) => {
    const { Agent, Metric } = db;
  })
  .catch((e) => console.error(e));
```

## About

This is just the database module, we will use this module for creating models and relations to the database.
