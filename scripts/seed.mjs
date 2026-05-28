import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Date.now();

const donations = [
  {
    restaurantName: "Spice Garden",
    foodItem: "Chicken Biryani & Dal Fry",
    quantity: "20 portions",
    pickupWindow: "6:00 PM – 8:00 PM",
    status: "available",
    lat: 17.385,
    lng: 78.4867,
    createdAt: now - 3_600_000,
    claimedBy: null,
    restaurantId: "seed",
  },
  {
    restaurantName: "The Tandoor House",
    foodItem: "Butter Roti & Paneer Curry",
    quantity: "30 portions",
    pickupWindow: "7:00 PM – 9:00 PM",
    status: "available",
    lat: 17.442,
    lng: 78.459,
    createdAt: now - 7_200_000,
    claimedBy: null,
    restaurantId: "seed",
  },
  {
    restaurantName: "Cafe Noorani",
    foodItem: "Haleem & Naan",
    quantity: "15 portions",
    pickupWindow: "8:00 PM – 10:00 PM",
    status: "claimed",
    lat: 17.36,
    lng: 78.474,
    createdAt: now - 10_800_000,
    claimedBy: "shelter-demo",
    restaurantId: "seed",
  },
  {
    restaurantName: "Hyderabad Dhaba",
    foodItem: "Steamed Rice & Mixed Vegetable Curry",
    quantity: "25 portions",
    pickupWindow: "5:30 PM – 7:30 PM",
    status: "available",
    lat: 17.41,
    lng: 78.503,
    createdAt: now - 1_800_000,
    claimedBy: null,
    restaurantId: "seed",
  },
  // Arlington, Virginia
  {
    restaurantName: "The Liberty Grill",
    foodItem: "BBQ Pulled Pork Sandwiches",
    quantity: "18 portions",
    pickupWindow: "5:00 PM – 7:00 PM",
    status: "available",
    lat: 38.8816,
    lng: -77.091,
    createdAt: now - 2_400_000,
    claimedBy: null,
    restaurantId: "seed",
  },
  {
    restaurantName: "Rosslyn Bistro",
    foodItem: "Caesar Salad & Garlic Bread",
    quantity: "22 portions",
    pickupWindow: "7:30 PM – 9:00 PM",
    status: "claimed",
    lat: 38.8963,
    lng: -77.0736,
    createdAt: now - 5_400_000,
    claimedBy: "shelter-demo",
    restaurantId: "seed",
  },
  {
    restaurantName: "Pentagon City Eats",
    foodItem: "Grilled Chicken & Roasted Vegetables",
    quantity: "35 portions",
    pickupWindow: "6:00 PM – 8:30 PM",
    status: "available",
    lat: 38.8573,
    lng: -77.0519,
    createdAt: now - 900_000,
    claimedBy: null,
    restaurantId: "seed",
  },
  {
    restaurantName: "Ballston Bakehouse",
    foodItem: "Assorted Pastries & Sourdough",
    quantity: "40 items",
    pickupWindow: "4:00 PM – 6:00 PM",
    status: "available",
    lat: 38.8782,
    lng: -77.1047,
    createdAt: now - 4_200_000,
    claimedBy: null,
    restaurantId: "seed",
  },
];

async function seed() {
  console.log("🔍 Checking existing seed data…");

  // Clear old seed data first so re-running is idempotent
  const existing = await getDocs(
    query(collection(db, "donations"), where("restaurantId", "==", "seed"))
  );
  if (existing.size > 0) {
    console.log(`🗑  Removing ${existing.size} existing seed document(s)…`);
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
  }

  console.log("🌱 Seeding donations…");
  for (const d of donations) {
    const ref = await addDoc(collection(db, "donations"), d);
    const icon = d.status === "available" ? "🟢" : "⚫";
    console.log(`  ${icon} ${d.restaurantName} — ${d.foodItem} (${ref.id})`);
  }

  console.log(`\n✅ Seeded ${donations.length} donations into Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
