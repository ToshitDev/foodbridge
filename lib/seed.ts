import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

const SEED_DONATIONS = [
  {
    restaurantName: "Spice Garden",
    foodItem: "Biryani & Dal",
    quantity: "20 portions",
    pickupWindow: "6:00 PM – 8:00 PM",
    status: "available",
    lat: 17.385,
    lng: 78.4867,
    createdAt: Date.now() - 3600000,
    claimedBy: null,
    restaurantId: "seed",
  },
  {
    restaurantName: "The Tandoor House",
    foodItem: "Roti & Paneer Curry",
    quantity: "30 portions",
    pickupWindow: "7:00 PM – 9:00 PM",
    status: "available",
    lat: 17.442,
    lng: 78.459,
    createdAt: Date.now() - 7200000,
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
    createdAt: Date.now() - 10800000,
    claimedBy: "shelter-demo",
    restaurantId: "seed",
  },
  {
    restaurantName: "Hyderabad Dhaba",
    foodItem: "Rice & Mixed Curry",
    quantity: "25 portions",
    pickupWindow: "5:30 PM – 7:30 PM",
    status: "available",
    lat: 17.41,
    lng: 78.503,
    createdAt: Date.now() - 1800000,
    claimedBy: null,
    restaurantId: "seed",
  },
];

export async function seedDonationsIfEmpty() {
  try {
    const q = query(collection(db, "donations"), where("restaurantId", "==", "seed"));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const d of SEED_DONATIONS) {
        await addDoc(collection(db, "donations"), d);
      }
    }
  } catch {
    // silently skip — happens when firebase isn't configured yet
  }
}
