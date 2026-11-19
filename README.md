# CD API

A RESTful API built with Node.js, Express, and MongoDB for managing a collection of CDs. The application supports CRUD operations, flexible filtering, and input validation.

## Features

- Retrieve all CDs from the database
- Filter CDs by artist, genre, or release year
- Return specific fields using query parameters
- Add, update, and delete CD records
- Validate user input and MongoDB document IDs
- Handle errors with appropriate HTTP status codes

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cds` | Retrieve all CDs |
| GET | `/cds?artist=...` | Filter by artist |
| GET | `/cds?genre=...` | Filter by genre |
| GET | `/cds?before=2000` | Retrieve CDs released before 2000 |
| GET | `/cds?fields=title` | Retrieve CD titles only |
| POST | `/cds` | Add a new CD |
| PUT | `/cds/:id` | Update an existing CD |
| DELETE | `/cds/:id` | Delete a CD |

## Getting Started

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Ensure MongoDB is running locally.
4. Start the application using `node index.js`.
5. Access the API at `http://localhost:3000/cds`.

The application connects to a local MongoDB database named `cds`.
