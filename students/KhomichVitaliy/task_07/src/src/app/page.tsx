'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {Property} from "@/types/types";



async function fetchProperties(): Promise<Property[]> {
  const res = await fetch('/api/properties');
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
}

export default function CatalogPage() {
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });

  if (isLoading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Ошибка: {(error as Error).message}</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Каталог аренды жилья</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <Link key={property.id} href={`/property/${property.id}`} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            <Image src={property.image} alt={property.title} width={400} height={300} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{property.title}</h2>
              <p className="text-gray-600">{property.location}</p>
              <p className="text-lg font-bold mt-2">{property.price} ₽/сутки</p>
              <p className="text-sm text-gray-500">{property.rooms} комнаты • {property.area} м²</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}