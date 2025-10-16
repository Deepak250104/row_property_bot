import { MapPin, Home, ExternalLink, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const images = property.images && property.images.length > 0 ? property.images : [property.image_url].filter(Boolean);
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev: number) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev: number) => (prev - 1 + images.length) % images.length);

  return (
    <div className="bg-zinc-900 border-2 border-yellow-600/30 rounded-xl overflow-hidden hover:border-yellow-600 transition-all group">
      {images.length > 0 && (
        <div className="relative h-56 overflow-hidden bg-zinc-800">
          <img
            src={images[current]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {property.price_range}
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === current ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg group-hover:text-yellow-500 transition">
            {property.name}
          </h3>
          <p className="text-yellow-600 text-sm font-medium">{property.type}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-zinc-400">
            <MapPin size={16} className="mr-2 text-yellow-600" />
            {property.location}
          </div>
          <div className="flex items-center text-zinc-400">
            <Home size={16} className="mr-2 text-yellow-600" />
            {property.size}
          </div>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-black border border-yellow-600/50 text-yellow-600 rounded-lg text-xs"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="px-2 py-1 bg-black border border-yellow-600/50 text-yellow-600 rounded-lg text-xs">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {property.description && (
          <p className="text-zinc-400 text-sm line-clamp-2">{property.description}</p>
        )}

        <div className="flex gap-2 pt-2">
          {property.link && (
            <a
              href={property.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-4 py-2 rounded-lg hover:scale-[1.02] transition-transform font-medium"
            >
              <ExternalLink size={16} />
              View Details
            </a>
          )}
          <button className="flex items-center justify-center gap-2 bg-black border-2 border-yellow-600 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600 hover:text-white transition font-medium">
            <Phone size={16} />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
