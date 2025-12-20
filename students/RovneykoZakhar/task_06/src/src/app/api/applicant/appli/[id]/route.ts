import { getServerSession } from "next-auth";
import { authoptions } from "../../../../../../lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/db";

export async function POST(
  req: NextRequest,
) {
  try {
    const session = await getServerSession(authoptions);

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const id = searchParams.get("id");
    console.log("Received jobId:", id);

    if (!session?.user.id) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json(); // Parse JSON body
    const { resume } = body;

    // Check if resume is valid
    if (!resume || typeof resume !== "string") {
      return NextResponse.json(
        { message: "Invalid resume format" },
        { status: 400 }
      );
    }
    const jobId = id;
    // Create the applicant record
    const applicant = await prisma.applicant.create({
      data: {
        resume,
        userId: session.user.id,
        jobId,
      },
    });

    return NextResponse.json(applicant, { status: 200 });
  } catch (e) {
    console.error("Error while creating applicant:", e); // Log the error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req:NextRequest) {
  const session = await getServerSession(authoptions);
 
  const url = new URL(req.url);
 const searchParams = new URLSearchParams(url.search);
 const id = searchParams.get("id")

  console.log("Received jobId:", id);

  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const applicants = await prisma.applicant.findMany({
      where: {
        jobId: id,
      },
      include: {
        user: true, // include user details
        job: true, // include job details
      },
    });

    // console.log(applicants, "Applicants retrieved");

    return NextResponse.json(applicants, {
      status: 200,
    });
  } catch (e) {
    console.error("Error fetching applicants:", e);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
