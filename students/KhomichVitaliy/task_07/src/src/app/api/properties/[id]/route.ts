import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import {Property} from "@/types/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Теперь Promise!
) {
  const { id } = await params; // Асинхронно распаковываем

  const filePath = path.join(process.cwd(), 'public/data/properties.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const properties = JSON.parse(jsonData);


  const property = properties.find((p: Property) => p.id === Number(id));

  if (!property) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(property);
}