'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import {Property} from "@/types/types";

async function fetchProperty(id: string): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Not found');
    throw new Error('Ошибка загрузки');
  }
  return res.json();
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });

  if (!id || isLoading) {
    return <div className="p-8 text-center">Загрузка...</div>;
  }

  if (error || !property) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{property.title}</h1>
      <Image
        src={property.image}
        alt={property.title}
        width={800}
        height={500}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-2xl font-bold mb-4">{property.price} ₽/сутки</p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Локация:</strong> {property.location}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Комнаты:</strong> {property.rooms}
          </p>
          <p className="text-lg text-gray-700 mb-6">
            <strong>Площадь:</strong> {property.area} м²
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Описание</h2>
          <p className="text-gray-700">{property.description}</p>
        </div>
      </div>
    </div>
  );
}
