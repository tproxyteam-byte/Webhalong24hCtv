import type { Property } from "@/lib/types";
import { countAvailableNights, minCtvPriceNext30Days } from "@/lib/calendar";
import { PropertyCard } from "@/components/property/property-card";

interface CardViewProps {
  properties: Property[];
  today: string;
}

export function CardView({ properties, today }: CardViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          minCtvPrice={minCtvPriceNext30Days(p.pricing, today)}
          availableNights={countAvailableNights(p.bookings, today, 30)}
        />
      ))}
    </div>
  );
}
