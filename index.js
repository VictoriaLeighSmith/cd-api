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
  try {
    const cds = await Cd.find({}, { __v: 0 });

    return response.json(cds);
  } catch (error) {
    next(error);
  }
});

// ----------  POST /cds - Add a new CD ----------
app.post("/cds", async (request, response, next) => {
  const { title, artist, genre, year } = request.body;

  if (!title || !artist || !genre || !year) {
    response.status(400);
    return response.json({
      error: "Title, artist, genre, and year are required.",
    });
  }

  try {
    const newCd = new Cd({
      title: title,
      artist: artist,
      genre: genre,
      year: year,
    });

    await newCd.save();
    response.status(201).json(newCd);
  } catch (error) {
    next(error);
  }
});

// ----------  PUT /cds/:id - Update an existing CD ----------
app.put("/cds/:id", validateId, async (request, response, next) => {
  const { id } = request.params;
  const { title, artist, genre, year } = request.body;

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

  if (Object.keys(cdUpdates).length === 0) {
    return response.status(400).json({
      error: "At least one field must be provided to update CD.",
    });
  }

  try {
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

    if (!updatedCd) {
      return response.status(404).json({
        error: "No CD found with that ID.",
      });
    }

    return response.json(updatedCd);
  } catch (error) {
    next(error);
  }
});

// ----------  DELETE /cds/:id - Delete a CD ----------
app.delete("/cds/:id", validateId, async (request, response, next) => {
  const { id } = request.params;

  try {
    const deletedCd = await Cd.findByIdAndDelete(id);

    if (!deletedCd) {
      return response.status(404).json({
        error: "CD not found.",
      });
    }

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

function validateId(request, response, next) {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({
      error: "Invalid CD ID.",
    });
  }

  next();
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
