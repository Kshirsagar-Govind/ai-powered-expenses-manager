# MongoDB Expense Manager Backend

This is the MongoDB/Mongoose version of the existing expense manager API. It keeps the same routes and response contract as `backend`.

## Setup

```bash
npm install
copy .env.example .env
npm run build
npm start
```

Set `MONGODB_URI` to a local MongoDB connection string or a MongoDB Atlas URI. The default port is `5001` so it can run alongside the original backend.
