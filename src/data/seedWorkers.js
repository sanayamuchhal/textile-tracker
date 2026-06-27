import { db } from "./db";

export async function seedWorkers() {
  const count = await db.workers.count();

  if (count > 0) return;

  const workers = [
    "Rahul Kori",
    "Vishal Koshti",
    "Dharmendra Arya",
    "Raju Uike",
    "Sonam Vishwkarma",
    "Shivnarayan",
    "Rakesh Vishwkarma",
    "Shantilal",
    "Anita Barediya",
    "Vinod Male",
    "Purshotam",
    "Sapna Ludhia",
    "Rakesh Bangar",
    "Bachhu Singh",
    "Rakesh Kumar Kori",
    "Malkhan Singh",
    "Manmohan",
    "Subhash Verma",
    "Asha Mandloi",
    "Kalicharan Rangari",
    "Manish Vishwkarma",
    "Santosh Verma",
    "Jyoti Soni"
  ];

  await db.workers.bulkAdd(
    workers.map((name) => ({ name }))
  );

  console.log("Workers added successfully!");
}