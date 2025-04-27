'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Room } from '@/types/room';

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
          <Popup>
            <div className="max-w-xs">
              <h3 className="font-bold text-lg">{room.title || 'Room'}</h3>
              <p className="text-sm text-gray-600">{room.locality || ''} {room.district}, {room.state}</p>
              {room.price && <p className="font-medium">₹{room.price}</p>}
              {room.room_type && <p className="text-xs italic">{room.room_type}</p>}
              <button 
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
                onClick={() => window.location.href = `/rooms/${room.id}`}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}