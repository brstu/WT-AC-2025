import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { authoptions } from "../../../../../lib/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authoptions);

  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.search);
  const jobId = searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ message: "job is not found" }, { status: 401 });
  }

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Job fetched successfully", job },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const jobId = searchParams.get("id");
    if (!jobId) {
      return NextResponse.json(
        { message: "job is not found" },
        { status: 401 }
      );
    }

    const body = await req.json(); // Get request body

    // Ensure body only contains fields that are part of the Job model
    const {
      title,
      description,
      company,
      jobtype,
      location,
      salary,
      experience,
    } = body;

    const update = await prisma.job.update({
      where: {
        id: jobId, // Use jobId from params
      },
      data: {
        title,
        description,
        company,
        jobtype, // Ensure this matches the expected format (array, enum, etc.)
        location,
        salary,
        experience,
      },
    });

    return NextResponse.json(
      {
        message: "Job updated successfully",
        job: update, // Optionally return the updated job
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Internal server error while updating Job",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const jobId = searchParams.get("id");
    if (!jobId) {
      return NextResponse.json(
        { message: "job is not found" },
        { status: 401 }
      );
    }

    await prisma.job.delete({
      where: {
        id: jobId,
      },
    });
    return NextResponse.json(
      {
        message: "Job deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Internal server error while deleting Job",
      },
      {
        status: 500,
      }
    );
  }
}
