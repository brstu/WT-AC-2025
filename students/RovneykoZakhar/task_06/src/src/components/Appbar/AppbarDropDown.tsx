"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, LayoutDashboard, LogOut } from "lucide-react"
import Image from "next/image"

export function DropDown() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const router = useRouter()

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClickOutside])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="flex items-center space-x-4">
      {session?.user ? (
        <div className="relative z-20">
          <button
            type="button"
            id="dropdownToggle"
            onClick={handleToggle}
            className="px-4 py-2 flex items-center rounded-full text-primary text-sm border-2 border-emerald-300  hover:bg-accent hover:text-accent-foreground"
            aria-expanded={isOpen}
          >
            <Image
              src={session.user.image || "/placeholder.svg?height=28&width=28"}
              className="w-7 h-7 mr-3 rounded-full shrink-0"
              alt="User Profile" width={28} height={28}
            />
            {session.user.name || "User"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 fill-muted-foreground inline ml-3"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isOpen && (
            <ul
              id="dropdownMenu"
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50"
            >
              <li>
                <Link href="/appbar/profile" className="flex items-center px-4 py-2 hover:bg-accent text-sm hover:bg-emerald-500 hover:text-white">
                  <User className="w-4 h-4 mr-3" />
                  View profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center px-4 py-2 hover:bg-accent text-sm hover:bg-emerald-500 hover:text-white" >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center w-full px-4 py-2 hover:bg-accent text-sm hover:bg-emerald-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : (
        <>
          <Button  
            className="text-emerald-500 text-lg border border-emerald-500 hover:bg-emerald-500 hover:text-white transition duration-200"  
            onClick={() => {  
              router.push("/auth");  
            }}  
          >  
            I am a Job Seeker  
          </Button> 
          <Button
                onClick={() => {
                  router.push("/Employeeauth");
                }}
                className="relative rounded px-5 py-2 overflow-hidden group bg-emerald-500 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-emerald-400 transition-all ease-out duration-300"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative">Employer Login</span>
              </Button>

          
        </>
      )}
    </div>
  )
}



