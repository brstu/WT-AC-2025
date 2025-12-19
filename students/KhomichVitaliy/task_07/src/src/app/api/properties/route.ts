import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public/data/properties.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const properties = JSON.parse(jsonData);
  return NextResponse.json(properties);
}