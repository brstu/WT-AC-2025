import { getServerSession } from "next-auth";
import { authoptions } from "../../../../lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/db";
import { ProfileSchema } from "../../../../Schema/credentials-schema";



export async function POST(req: NextRequest) {
  const session = await getServerSession(authoptions);
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
    const body = await req.json();  
    console.log(body, "Incoming Request Body");  

    if (typeof body !== 'object' || !body) {  
        throw new Error("Invalid request body");  
    }  

    const profileparse = ProfileSchema.safeParse(body);  
    if (!profileparse.success) {  
        console.error("Validation Errors:", profileparse.error.format());  
        return NextResponse.json({  
            message: "Validation error",  
            errors: profileparse.error.format()  
        }, { status: 400 });  
    }  

    const { personalInfo, accountInfo } = profileparse.data;  
    console.log("Validated Personal Info:", personalInfo);  
    console.log("Validated Account Info:", accountInfo);  

    // Check session  
    if (!session || !session.user || !session.user.id) {  
        throw new Error("User not authenticated");  
    }  

    const userData = {  
        username: accountInfo.username || "defaultUsername",   
        firstName: personalInfo.firstName || "defaultFirst",   
        lastName: personalInfo.lastName || "defaultLast",   
          
        country: personalInfo.country || "Unknown",   
        streetAddress: personalInfo.streetAddress || "Unknown",   
        city: personalInfo.city || "Unknown",   
        state: personalInfo.state || "Unknown",   
        postalCode: personalInfo.postalCode || "000000",   
        workingYear: accountInfo.workingYear || 0,   
        workingMonth: accountInfo.workingMonth || 0,   
        links: accountInfo.links || null,   
        education: accountInfo.education || "Unknown",   
        gender: personalInfo.gender || "OTHER",   
        profilePic: body.profilePic || null,   
        preferedJobTitle: accountInfo.preferedJobTitle || "",   
        preferedLocation: accountInfo.preferedLocation || "",   
        skills: accountInfo.skills || "",   
        userId: session.user.id,  
    };  

    console.log("Final User Data for Prisma:", userData);  

    // Create user profile in Prisma  
    const response = await prisma.userProfile.create({  
        data: userData  
    });
    console.log("User profile created successfully:", response); 
    return NextResponse.json({response})  
     

} catch (error) {  
    console.error("Error creating user profile:", error);  

    // Ensure that the error is logged correctly and respond with a valid payload  
    const message = error instanceof Error ? error.message : "Unknown error occurred";  
    
    return NextResponse.json({  
        message: "Error while creating User Profile",  
        error: message  
    }, {  
        status: 500,  
    });  
}
}

export async function GET() {
  const session = await getServerSession(authoptions);
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
  try{
    console.log("hello before ");
    
    const getprofile = await prisma.userProfile.findMany();
    return NextResponse.json({
        getprofile
    })

  }catch(e){
    console.error(e);
    return NextResponse.json({
        message:"Inter server Get error"
    },{
        status:500
    })    
  }
}
