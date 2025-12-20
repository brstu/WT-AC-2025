import { Button } from "@/components/ui/button";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function EmpAppbar() {
  const router = useRouter();
  const session = useSession();
  return (
    <div className=" fixed z-30 top-0 left-0 right-0  flex justify-between items-center px-5 py-4 md:px-10 xl:px-20 bg-white shadow-md">
      <div className="text-emerald-500 font-bold text-3xl">
        <Link href={"/"}>
          <Image
            src="https://i.ibb.co/PsZFynfm/download.png"
            className="w-[130px]" alt={""} width={500} height={500}         />
        </Link>
      </div>
      <div className="flex justify-between  w-[25%]">
        <div className=" font-semibold hover:text-emerald-500  text-xl hover:underline">
          <Link href={"/Empdashboard"}>
            {" "}
            <button>Dashboard</button>
          </Link>
        </div>
        {!session.user ? (
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="relative rounded px-5 py-2 overflow-hidden group bg-emerald-500 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-emerald-400 transition-all ease-out duration-300"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
            <span className="relative">Logout</span>
          </Button>
        ) : (
          <Button
            onClick={() => {
              router.push("/Employeeauth");
            }}
            className="relative rounded px-5 py-2 overflow-hidden group bg-emerald-500 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-emerald-400 transition-all ease-out duration-300"
          >
            <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
            <span className="relative">Employer Login</span>
          </Button>
        )}
      </div>
    </div>
  );
}
