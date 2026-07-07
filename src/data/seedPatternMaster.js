import { db } from "./db";

export const patternMasterSeed = [
  {
    category: "Trouser",
    jobs: [
      "Number",
      "Interlock",
      "Front",
      "Back",
      "Side Inside",
      "Belt",
      "Loop",
      "Loop Making",
      "MP Open",
      "MP",
      "Bottom",
      "Thread Cutting",
      "Press",
    ],
  },
  {
    category: "Shirt",
    jobs: [
      "Number",
      "Body",
      "FOA",
      "Collar",
      "Cup",
      "Bottom",
      "Thread Cutting",
      "Press",
    ],
  },
  {
    category: "Lower",
    jobs: ["Number", "Interlock", "Front", "Side Inside"],
  },
];

export async function ensurePatternMasterSeed() {
  const existingCount = await db.patternMaster.count();

  if (existingCount > 0) return;

  await db.patternMaster.bulkAdd(
    patternMasterSeed.flatMap(({ category, jobs }) =>
      jobs.map((job) => ({ category, job }))
    )
  );
}
