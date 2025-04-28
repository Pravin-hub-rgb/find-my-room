'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Room } from '@/types/room';
import Link from 'next/link';
import { Button } from './ui/button';

// Extend the default icon options interface
interface CustomIconOptions extends L.IconOptions {
  iconRetinaUrl: string;
  iconUrl: string;
  shadowUrl: string;
}

// Type augmentation for Leaflet's Icon prototype
declare module 'leaflet' {
  interface Icon {
    _getIconUrl?: string;
  }
}

interface MapComponentProps {
  rooms: Array<Room & { latitude: number; longitude: number }>;
}

export default function MapComponent({ rooms }: MapComponentProps) {
  // Fix Leaflet default icon issue
  useEffect(() => {
    // Create a type-safe way to handle the icon options
    const iconOptions: CustomIconOptions = {
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    };

    // Type-safe check and delete of _getIconUrl
    const defaultIconProto = L.Icon.Default.prototype;
    if (defaultIconProto._getIconUrl) {
      delete defaultIconProto._getIconUrl;
    }

    L.Icon.Default.mergeOptions(iconOptions);
  }, []);

  // Center of India
  const defaultCenter: [number, number] = [22.9734, 78.6569];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rooms.map(room => (
        <Marker
          key={room.id}
          position={[room.latitude, room.longitude]}
        >
          <Popup minWidth={150} maxWidth={200}>
            <div className="py-1 px-2">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm">{room.bhk_type || 'Room'}</p>
                {room.price && <p className="font-medium text-sm">₹{room.price}/mo</p>}
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {room.locality && room.locality.toLowerCase() !== room.district.toLowerCase()
                  ? room.locality + ', '
                  : ''}
                {room.district}, {room.state}
              </p>
              <Button
                asChild
                className="w-full py-1 mt-1 bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs h-auto"
              >
                <Link
                  className="text-white !text-white no-underline font-bold"
                  href={`/rooms/${room.id}`}
                  style={{ color: 'white !important', fontWeight: '700' }}
                >
                  View Details
                </Link>
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}