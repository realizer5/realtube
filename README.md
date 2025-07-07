# Backend in Express & Mongoose
This is a practice repository for leaning bakcend with Express and Mongoose

## Project Structure

```
realtube/
├── public/                  # Publicly accessible static files
│   └── temp/                # Temporary files (e.g., uploads, caching)
│
├── src/                     # Source code
│   ├── controllers/         # Route handlers / business logic
│   ├── db/                  # Database connection and config
│   ├── middlewares/         # Custom middleware (auth, error handling, etc.)
│   ├── models/              # Mongoose models (schemas)
│   ├── routes/              # Express route definitions
│   ├── utils/               # Utility functions and helpers
│   ├── app.js               # Express app setup
│   ├── constants.jsx        # App-wide constants (e.g., roles, config keys)
│   └── index.js             # Application entry point
│
└── package.json             # Project metadata and dependencies
```
