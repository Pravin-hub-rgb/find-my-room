'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Room } from '@/types/room';

interface RoomDetailMapProps {
  room: Room & { latitude: number; longitude: number };
}

export default function RoomDetailMap({ room }: RoomDetailMapProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Import leaflet dynamically on the client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      
      // Fix Leaflet default icon issue
      const icon = leaflet.default.Icon.Default.prototype as any;
      delete icon._getIconUrl;
      
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!L) return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>;

  return (
    <MapContainer
      center={[room.latitude, room.longitude]}
      zoom={15}
      style={{ height: '400px', width: '70%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[room.latitude, room.longitude]}>
        <Popup>
          <div className="max-w-xs">
            <h3 className="font-bold">{room.title}</h3>
            <p>{room.locality}, {room.district}, {room.state}</p>
            {room.price && <p>₹{room.price}</p>}
            <p>{room.room_type}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}