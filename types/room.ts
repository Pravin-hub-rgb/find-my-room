// types/room.ts
export interface Room {
    id: string;
    title?: string;
    description?: string;
    room_type?: string;
    price?: number;
    state: string;
    district: string;
    locality?: string;
    address?: string;
    latitude: number | null;
    longitude: number | null;
    image_urls?: string[];
    created_at?: string;
  }