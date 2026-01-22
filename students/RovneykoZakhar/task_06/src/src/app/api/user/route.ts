
import { getServerSession } from "next-auth";
import {  NextResponse } from "next/server";
import { authoptions } from "../../../../lib/auth-options";

export const GET = async () => {
  const session = await getServerSession(authoptions);

  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      },
    );
  }
  return NextResponse.json({
    user: session.user,
  });
};

// dont static render
export const dynamic = "force-dynamic";
