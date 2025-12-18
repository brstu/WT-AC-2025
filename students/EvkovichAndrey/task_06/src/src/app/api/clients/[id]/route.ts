import {getUserId} from "@/utils/auth";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/utils/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const {id} = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: {id},
    include: {
      comments: {
        orderBy: {createdAt: "desc"},
        take: 5,
        include: {
          author: true,
        }
      }
    }
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}