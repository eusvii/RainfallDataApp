require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

app.get("/api/rainfall", async (req, res) => {
  const { date } = req.query;

  try {
    if (date) {
      const result = await pool.query(
        `
      SELECT timestamp, value
      FROM rainfalldata
      WHERE timestamp ::date = $1
      ORDER BY timestamp ASC
    `,
        [date]
      );
      res.json(result.rows);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rainfall/daterange", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(MIN(timestamp), 'YYYY-MM-DD') as min_date,
        TO_CHAR(MAX(timestamp), 'YYYY-MM-DD') as max_date
      FROM rainfalldata`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
