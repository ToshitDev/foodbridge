export type DonationStatus = "available" | "claimed" | "collected";

export interface Donation {
  id: string;
  restaurantName: string;
  foodItem: string;
  quantity: string;
  pickupWindow: string;
  status: DonationStatus;
  lat: number;
  lng: number;
  createdAt: number;
  claimedBy: string | null;
  restaurantId: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "restaurant" | "shelter";
  name: string;
}
