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

## Render deployment

Create a Render Web Service with the server directory as the root directory, then use:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/health`

Add these environment variables in Render:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: a long random secret
- `FRONTEND_URL`: the deployed frontend URL
- `GROQ_API_KEY` or `OPENAI_API_KEY`: whichever provider is enabled
- `NODE_ENV=production`

In MongoDB Atlas, add Render's outbound address to Network Access. For a service without a fixed outbound IP, Atlas commonly requires `0.0.0.0/0` with a strong database password.

If the database password contains characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode it before placing it in `MONGODB_URI`.
