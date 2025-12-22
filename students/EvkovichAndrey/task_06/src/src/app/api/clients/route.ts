import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/utils/prisma';
import {getUserId} from "@/utils/auth";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const clients = await prisma.client.findMany({
    where: {ownerId: userId},
    include: {comments: {take: 3, orderBy: {createdAt: 'desc'}}},
    orderBy: {createdAt: 'desc'},
  });

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  const body = await request.json();

  const client = await prisma.client.create({
    data: {...body, ownerId: userId},
  })

  return NextResponse.json(client, {status: 201});
}
