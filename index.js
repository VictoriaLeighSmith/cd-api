const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/cds");

const cdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
});

const Cd = mongoose.model("cd", cdSchema, "cds");

// ---------- GET /cds - Return all CDs ----------
app.get("/cds", async (request, response, next) => {
  const { fields, artist, genre, before } = request.query;

  // Validate that the user entered a number for before query param
  if (before && Number.isNaN(Number(before))) {
    return response.status(400).json({
      error: "The before query parameter must be a valid year.",
    });
  }

  // Create filtering object with query params
  const filters = {};

  if (artist) {
    filters.artist = artist;
  }

  if (genre) {
    filters.genre = genre;
  }

  if (before) {
    filters.year = {
      $lt: Number(before),
    };
  }

  try {
    // If the fields param is title, turn off everything in the projection except for the title
    if (fields === "title") {
      const cds = await Cd.find(filters, { title: 1, _id: 0 });
      return response.json(cds);
    }

    const cds = await Cd.find(filters, { __v: 0 });

    return response.json(cds);
  } catch (error) {
    next(error);
  }
});

// ----------  POST /cds - Add a new CD ----------
app.post("/cds", validateYear, async (request, response, next) => {
  const { title, artist, genre, year } = request.body;

  // Validate that the user supplied all necessary input
  if (!title || !artist || !genre || !year) {
    return response.status(400).json({
      error: "Title, artist, genre, and year are required.",
    });
  }

  // Create new CD record with user input
  try {
    const newCd = new Cd({
      title: title,
      artist: artist,
      genre: genre,
      year: year,
    });

    await newCd.save();
    return response.status(201).json(newCd);
  } catch (error) {
    next(error);
  }
});

// ----------  PUT /cds/:id - Update an existing CD ----------
app.put(
  "/cds/:id",
  validateId,
  validateYear,
  async (request, response, next) => {
    const { id } = request.params;
    const { title, artist, genre, year } = request.body;

    // Create CD object with only the supplied fields to allow user to update single or multiple fields
    const cdUpdates = {};

    if (title) {
      cdUpdates.title = title;
    }

    if (artist) {
      cdUpdates.artist = artist;
    }

    if (genre) {
      cdUpdates.genre = genre;
    }

    if (year !== undefined) {
      cdUpdates.year = year;
    }

    // Check to make sure that at least one field was supplied for the update
    if (Object.keys(cdUpdates).length === 0) {
      return response.status(400).json({
        error: "At least one field must be provided to update the CD.",
      });
    }

    try {
      // Find and update the CD by ID with the fields provided. Added runValidators here to make sure we use the schema's rules.
      const updatedCd = await Cd.findByIdAndUpdate(
        id,
        {
          $set: cdUpdates,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      // If the updated CD is falsy, let the user know it doesn't exist
      if (!updatedCd) {
        return response.status(404).json({
          error: "No CD found with that ID.",
        });
      }

      return response.json(updatedCd);
    } catch (error) {
      next(error);
    }
  },
);

// ----------  DELETE /cds/:id - Delete a CD ----------
app.delete("/cds/:id", validateId, async (request, response, next) => {
  const { id } = request.params;

  try {
    // Find and delete the CD by ID
    const deletedCd = await Cd.findByIdAndDelete(id);

    // If the deleted CD is falsy, let the user know it doesn't exist
    if (!deletedCd) {
      return response.status(404).json({
        error: "CD not found.",
      });
    }

    // Display deleted CD to the user
    return response.status(200).json(deletedCd);
  } catch (error) {
    next(error);
  }
});

// ---------- Middleware for error handling ----------
app.use((error, request, response, next) => {
  console.error(error);

  return response.status(500).json({
    error: "An internal server error occurred.",
  });
});

// Validation middleware to validate the CD's ID
function validateId(request, response, next) {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({
      error: "Invalid CD ID.",
    });
  }

  next();
}

// Validation middleware to validate that supplied year is a number
function validateYear(request, response, next) {
  const { year } = request.body;

  if (year !== undefined && Number.isNaN(Number(year))) {
    return response.status(400).json({
      error: "Year must be a valid number.",
    });
  }

  next();
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
