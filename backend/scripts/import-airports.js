const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');
dotenv.config();

const { connectMongo } = require('../config/database');
const Airport = require('../models/Airport');

const INPUT_PATH = process.env.AIRPORTS_CSV_PATH || path.join(__dirname, 'data', 'airports.csv');

async function ensureIndexes() {
  await Airport.collection.createIndex({ code: 1 }, { unique: true });
  await Airport.collection.createIndex({ city: 1 });
  await Airport.collection.createIndex({ country: 1 });
}

async function importAirports() {
  await connectMongo();

  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Airports CSV not found at: ${INPUT_PATH}`);
    process.exit(1);
  }

  const batch = [];
  const BATCH_SIZE = 5000;
  let total = 0;

  function toNum(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }

  function flushBatch() {
    if (batch.length === 0) return Promise.resolve();
    const docs = batch.splice(0, batch.length);
    return Airport.bulkWrite(
      docs.map(doc => ({
        updateOne: {
          filter: { code: doc.code },
          update: { $set: doc },
          upsert: true
        }
      })),
      { ordered: false }
    );
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // OurAirports columns reference: ident, type, name, latitude_deg, longitude_deg, iso_country, municipality, iata_code
        const iata = (row.iata_code || row.IATA || row.iata || '').trim();
        if (!iata) return; // skip entries without IATA

        const city = (row.municipality || row.city || '').trim();
        const country = (row.iso_country || row.country || '').trim();
        const name = (row.name || '').trim();
        const latitude = toNum(row.latitude_deg || row.latitude || row.lat);
        const longitude = toNum(row.longitude_deg || row.longitude || row.lon || row.lng);

        const doc = {
          id: `AP_${iata}`,
          code: iata,
          name,
          city,
          country,
          latitude,
          longitude
        };

        batch.push(doc);
        total++;
        if (batch.length >= BATCH_SIZE) {
          // backpressure by pausing stream until flushed
          this.pause?.();
          flushBatch()
            .then(() => this.resume?.())
            .catch(reject);
        }
      })
      .on('end', async () => {
        try {
          await flushBatch();
          await ensureIndexes();
          console.log(`✅ Imported/updated ${total} airports with IATA codes.`);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
      .on('error', reject);
  });
}

importAirports()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Import failed:', err.message);
    process.exit(1);
  });


