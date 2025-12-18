import {NextRequest, NextResponse} from "next/server";
import {getUserId} from "@/utils/auth";
import prisma from "@/utils/prisma";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const invoices = await prisma.invoice.findMany({
    where: {ownerId: userId},
    orderBy: {createdAt: 'desc'},
    include: {
      client: true,
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  const body = await req.json();
  const client = await prisma.client.findUnique({
    where: {email: body.clientEmail}
  });

  if (!client) {
    return NextResponse.json({error: "Client not found"}, {status: 404});
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        number: body.number,
        amount: body.amount, // Decimal в Prisma можно передавать как строку или число
        status: body.status ?? "PENDING",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        clientId: client.id,
        ownerId: userId,
      },
    });
    return NextResponse.json(invoice, {status: 201});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to create invoice", status: 500});
  }
}