import { getServerSession } from "next-auth";
import { authoptions } from "../../../../lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/db";
import { empboardSchema } from "../../../../Schema/credentials-schema";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authoptions);
  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log(body, "yash emp body");
    const empboardparse = empboardSchema.safeParse(body);
    if(!empboardparse.success){
      console.error("Validation failed:", empboardparse.error); // Log the validation error details  
      return NextResponse.json({
        message:"Invaild data format"
      },{
        status:400
      })
    }
    console.log(empboardparse.data,"empfata");
    
    const { name, companyname, phonenumber, email } = empboardparse.data;
    const response = await prisma.employee.create({
      data: {
        name,
        email,
        phonenumber,
        companyname,
        userId: session?.user.id,
      },
    });
    console.log(response, "yash emp response");

    return NextResponse.json({ ...response });
  } catch (error) {
    console.error("Error creating Employeee profile:", error);
    return NextResponse.json(
      { message: "Error while creating Employee Profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authoptions);
  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const employee = await prisma.user.findUnique({
      where: { email: session.user.email || "" },
    });

    if (!employee) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Employee detail fetched successfully",
      employee,
    });
  } catch (e) {
    console.error("Error fetching employee details:", e);
    return NextResponse.json(
      { message: "Internal server GET error" },
      { status: 500 }
    );
  }
}
