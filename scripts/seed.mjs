import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, deleteDoc,
} from "firebase/firestore";

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

const H = 60 * 60_000; // 1 hour in ms

const donations = [
  // ── Hyderabad ─────────────────────────────────────────────────────────────
  {
    restaurantName: "Spice Garden",
    foodItem: "Chicken Biryani & Dal Fry",
    quantity: "20 portions",
    pickupWindow: "6:00 PM – 8:00 PM",
    address: "Road No. 12, Banjara Hills, Hyderabad",
    tags: ["non-veg"],
    status: "available",
    lat: 17.4239, lng: 78.4738,
    createdAt: now - 1 * H,
    expiresAt: now + 3 * H,          // green countdown
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  {
    restaurantName: "The Tandoor House",
    foodItem: "Butter Roti & Paneer Curry",
    quantity: "30 portions",
    pickupWindow: "7:00 PM – 9:00 PM",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    tags: ["veg"],
    status: "available",
    lat: 17.4329, lng: 78.4073,
    createdAt: now - 2 * H,
    expiresAt: now + 25 * 60_000,    // orange countdown (~25 min)
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  {
    restaurantName: "Cafe Noorani",
    foodItem: "Haleem & Sheermal",
    quantity: "15 portions",
    pickupWindow: "8:00 PM – 10:00 PM",
    address: "Charminar Road, Old City, Hyderabad",
    tags: ["non-veg", "allergen-free"],
    status: "claimed",
    lat: 17.3616, lng: 78.4747,
    createdAt: now - 3 * H,
    expiresAt: now - 30 * 60_000,    // expired (past)
    claimedBy: "shelter-demo",
    restaurantId: "seed",
    hasUnreadForRestaurant: true,
  },
  {
    restaurantName: "Hyderabad Dhaba",
    foodItem: "Steamed Rice & Mixed Vegetable Curry",
    quantity: "25 portions",
    pickupWindow: "5:30 PM – 7:30 PM",
    address: "HITEC City Main Road, Madhapur, Hyderabad",
    tags: ["veg", "allergen-free"],
    status: "available",
    lat: 17.4435, lng: 78.3772,
    createdAt: now - 30 * 60_000,
    expiresAt: now + 8 * 60_000,     // red countdown (<10 min)
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  {
    restaurantName: "Paradise Biryani",
    foodItem: "Mutton Biryani",
    quantity: "18 portions",
    pickupWindow: "9:00 PM – 10:30 PM",
    address: "MG Road, Secunderabad, Hyderabad",
    tags: ["non-veg"],
    status: "available",
    lat: 17.4399, lng: 78.4983,
    createdAt: now - 45 * 60_000,
    expiresAt: now + 2 * H,
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  {
    restaurantName: "Green Bowl Cafe",
    foodItem: "Veg Pulao & Raita",
    quantity: "22 portions",
    pickupWindow: "4:00 PM – 6:00 PM",
    address: "Gachibowli Stadium Road, Gachibowli, Hyderabad",
    tags: ["veg", "allergen-free"],
    status: "claimed",
    lat: 17.4401, lng: 78.3489,
    createdAt: now - 4 * H,
    expiresAt: now - 1 * H,          // expired
    claimedBy: "shelter-demo",
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  // ── Arlington, Virginia ───────────────────────────────────────────────────
  {
    restaurantName: "The Liberty Grill",
    foodItem: "BBQ Pulled Pork Sandwiches",
    quantity: "18 portions",
    pickupWindow: "5:00 PM – 7:00 PM",
    address: "2300 Clarendon Blvd, Arlington, VA",
    tags: ["non-veg"],
    status: "available",
    lat: 38.8863, lng: -77.093,
    createdAt: now - 40 * 60_000,
    expiresAt: now + 4 * H,
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
  {
    restaurantName: "Crystal City Bistro",
    foodItem: "Garden Salad & Sourdough Rolls",
    quantity: "28 portions",
    pickupWindow: "6:30 PM – 8:00 PM",
    address: "2221 S Clark St, Crystal City, Arlington, VA",
    tags: ["veg", "allergen-free"],
    status: "available",
    lat: 38.8573, lng: -77.0519,
    createdAt: now - 20 * 60_000,
    expiresAt: now + 3 * H,
    claimedBy: null,
    restaurantId: "seed",
    hasUnreadForRestaurant: false,
  },
];

// Seed chat messages for claimed donations
const seedChats = {
  "Cafe Noorani": [
    { senderId: "shelter-demo", senderName: "Hope Shelter", text: "Hi! We'll be there by 9pm to pick up the haleem.", createdAt: now - 2.5 * H },
    { senderId: "seed",         senderName: "Cafe Noorani",  text: "Great! Please use the back entrance on Charminar Road.", createdAt: now - 2.4 * H },
    { senderId: "shelter-demo", senderName: "Hope Shelter", text: "Got it, thank you! We'll bring our own containers.", createdAt: now - 2.3 * H },
  ],
  "Green Bowl Cafe": [
    { senderId: "shelter-demo", senderName: "Hope Shelter", text: "Picking up the pulao around 5:30. Is that okay?", createdAt: now - 3.8 * H },
    { senderId: "seed",         senderName: "Green Bowl Cafe", text: "Perfect timing! Ask for Ravi at the counter.", createdAt: now - 3.7 * H },
  ],
};

async function seed() {
  console.log("🔍 Checking existing seed data…");

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
    console.log(`  ${icon} ${d.restaurantName} — ${d.foodItem} [${d.tags.join(", ")}] (${ref.id})`);

    // Seed chat messages for claimed donations
    const messages = seedChats[d.restaurantName];
    if (messages) {
      for (const msg of messages) {
        await addDoc(collection(db, "donations", ref.id, "messages"), msg);
      }
      console.log(`     💬 Added ${messages.length} seed message(s)`);
    }
  }

  console.log(`\n✅ Seeded ${donations.length} donations into Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
