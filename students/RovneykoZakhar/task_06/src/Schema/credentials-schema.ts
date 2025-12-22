import {z} from "zod"

export const emailSchema = z
    .string({message:"Email Reaquired"})
    .email({message:"Invail Email"})

export const passwordSchema = z
    .string({message:"Invalid password"})
    .min(8,{message:"Password length should be 8 Character"})
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,{
        message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })

export const nameSchema = z
    .string({message:"Invaild name"})
    

export const empjobSchema = z.object({
    title:z.string({message:"Invaild name"}),
    description:z.string({message:"Invaild description"}),
    company:z.string({message:"Invaild company"}),
    salary:z.number({message:"Invaild salary"}),
    location:z.string({message:"Invaild location"}),
    jobtype:z.string({message:"Invaild jobtype"}),
    experience:z.number({message:"Invaild experience"}),
})

export const empboardSchema = z.object({
    name:z.string({message:"Invaild experience"}),
    email:z.string().email({message:"Invaild experience"}),
    phonenumber:z.string({message:"Invaild experience"}),
    companyname:z.string({message:"Invaild experience"}),
})

const PersonalInfoSchema = z.object({  
    firstName: z.string({ message: "Invalid first name" }),  
    lastName: z.string({ message: "Invalid last name" }),    
    country: z.string({ message: "Invalid country" }),  
    streetAddress: z.string({ message: "Invalid street address" }),  
    city: z.string({ message: "Invalid city" }),  
    state: z.string({ message: "Invalid state" }),  
    postalCode: z.string({ message: "Invalid postal code" }),  
    gender: z.string({ message: "Invalid gender" }),  
});  

const AccountInfoSchema = z.object({  
    username: z.string({ message: "Invalid username" }),  
    education: z.string({ message: "Invalid education" }),  
    preferedJobTitle: z.string({ message: "Invalid preferred job title" }).optional(),  
    preferedLocation: z.string({ message: "Invalid preferred location" }).optional(),  
    skills: z.string({ message: "Invalid skills" }).optional(),  
    workingMonth: z.number({ message: "Invalid working month" }),  
    workingYear: z.number({ message: "Invalid working year" }),  
    links: z.string({ message: "Invalid links" }).optional(),  
});  

export const ProfileSchema = z.object({  
    personalInfo: PersonalInfoSchema,  
    accountInfo: AccountInfoSchema,  
});  