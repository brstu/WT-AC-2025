import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from "../Schema/credentials-schema";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authoptions = {
  
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        name: { type: "name" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          !credentials.email ||
          !credentials.password ||
          !credentials.name
        ) {
          return null;
        }
        const emailValidation = emailSchema.safeParse(credentials.email);
        if (!emailValidation.success) {
          throw new Error("Invaild Email");
        }
        const passwordValidation = passwordSchema.safeParse(
          credentials.password
        );
        if (!passwordValidation.success) {
          throw new Error("Invaild Password");
        }
        const nameValidation = nameSchema.safeParse(credentials.name);
        if (!nameValidation.success) {
          throw new Error("Invaild name");
        }
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: emailValidation.data,
            },
          });
          const hashedPassword = await bcrypt.hash(passwordValidation.data, 10);
          if (!user) {
            const newUser = await prisma.user.create({
              data: {
                email: emailValidation.data,
                password: hashedPassword,
                name: nameValidation.data,
                provider: "Credentials",
              },
            });
            return newUser;
          }
          if (!user.password) {
            const authuser = await prisma.user.update({
              where: {
                email: emailValidation.data,
              },
              data: {
                password: hashedPassword,
              },
            });
            return authuser;
          }
          const passwordVerify = await bcrypt.compare(
            passwordValidation.data,
            user.password
          );
          if (!passwordVerify) {
            throw new Error("Inavalid password");
          }

          return user;
        } catch (e) {
          console.error(e)
          throw new Error("Internal server error",);
          
          
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours in seconds  
    updateAge: 60 * 60, // 1 hour in seconds (optional: refresh session every hour) 
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email as string;
        token.id = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
        try{
            const user =await prisma.user.findUnique({
                where:{
                    email:token.email
                }
            })
            if(user){
                session.user.id = user.id;
            }
            
        }catch(error){
            console.log(error);
            throw new Error("Internal server error")  
        }
        return session;
    },
    async signIn({account, profile}){
        try{
          console.log("before signin");
          console.log(account,"github account");
          console.log(profile,"profile account");
          
          if (account?.provider === "github" && profile) {
                const user = await prisma.user.findUnique({
                    where:{
                        email:profile?.email
                    }
                })
                console.log("after sigin");
                
                if(!user){
                    const newUser = await prisma.user.create({
                        data:{
                            email:profile?.email ?? "",
                            name:profile?.name || undefined,
                            provider:"Github"
                        }
                    });
                    console.log(newUser,"yash newuser");
                }
            }
            return true      
        }catch(error){
            console.log(error); 
            return false;
        }
    }
  },
}satisfies NextAuthOptions
