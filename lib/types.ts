export type DonationStatus = "available" | "claimed" | "collected";

export interface Donation {
  id: string;
  restaurantName: string;
  foodItem: string;
  quantity: string;
  pickupWindow: string;
  address: string;
  tags: string[];
  expiresAt: number;
  status: DonationStatus;
  lat: number;
  lng: number;
  createdAt: number;
  claimedBy: string | null;
  restaurantId: string;
  hasUnreadForRestaurant?: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  role: "restaurant" | "shelter";
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}
