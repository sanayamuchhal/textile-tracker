import { db } from "./db";

export async function seedJobs() {
  const count = await db.jobs.count();

  if (count > 0) return;

  const jobs = [
    "FOA",
    "Top",
    "Side",
    "Belt",
    "Loop Making",
    "MP+Bottom",
    "Mp Open",
    "Body",
    "Collar",
    "Cuff",
    "Bottom",
    "Front",
    "Back",
    "Sample",
    "Side Pocket",
    "Lower",
    "Number",
    "Belt Stitch",
    "Taki",
    "Loop",
    "Pocket",
    "Down",
    "Placket",
    "Belt Elastic",
    "Interlock"
  ];

  await db.jobs.bulkAdd(
    jobs.map((name) => ({ name }))
  );
}