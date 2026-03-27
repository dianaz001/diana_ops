import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Star } from 'lucide-react';
import type { RentalListing } from '../../types/rentals';
import 'leaflet/dist/leaflet.css';

interface RentalMapProps {
  listings: RentalListing[];
}

// Custom numbered marker icon
function createNumberedIcon(rank: number, rejected: boolean) {
  const color = rejected ? '#94a3b8' : rank <= 2 ? '#16a34a' : rank <= 4 ? '#2563eb' : '#f59e0b';
  return L.divIcon({
    className: 'rental-marker',
    html: `<div style="
      background: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${rejected ? '✕' : rank}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Auto-fit bounds to all markers
function FitBounds({ listings }: { listings: RentalListing[] }) {
  const map = useMap();
  useEffect(() => {
    if (listings.length === 0) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [listings, map]);
  return null;
}

export function RentalMap({ listings }: RentalMapProps) {
  // Center on midtown Toronto
  const center: [number, number] = [43.6900, -79.3940];

  return (
    <div className="rounded-2xl overflow-hidden one-pixel-border" style={{ height: 420 }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds listings={listings} />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={createNumberedIcon(listing.rank, listing.rejected)}
          >
            <Popup>
              <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                  {listing.rejected ? '✕ ' : `#${listing.rank} `}
                  {listing.address}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  {listing.location}
                </div>
                {listing.finalPrice > 0 && (
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                    ${listing.finalPrice.toLocaleString()}/mo
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      style={{
                        width: 12,
                        height: 12,
                        fill: i <= listing.onlineRating ? '#fbbf24' : 'none',
                        color: i <= listing.onlineRating ? '#fbbf24' : '#cbd5e1',
                      }}
                    />
                  ))}
                </div>
                {listing.promotions && (
                  <div style={{ fontSize: 11, color: '#16a34a', marginBottom: 4 }}>
                    {listing.promotions}
                  </div>
                )}
                <a
                  href={listing.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#195de6',
                    textDecoration: 'none',
                  }}
                >
                  View listing <ExternalLink style={{ width: 11, height: 11 }} />
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
