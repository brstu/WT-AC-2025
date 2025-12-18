"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface EmpFormProp {
  name: string;
  email: string;
  phonenumber: string;
  companyname: string;
}

export function EmpBoarding() {
  const [empformdata, setEmpformdata] = useState<EmpFormProp[]>([]);
  const [name, setName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [companyname, setCompanyname] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  
  async function Employeefetch(e: React.FormEvent) {  
    e.preventDefault(); 

    //TODO:add zod validation here👇
    const formData = {  
      name,  
      email,  
      phonenumber,  
      companyname  
    };  
  
    try {  
      console.log("before emp board");
      
      const response = await fetch("/api/empauth", {  
        method: "POST",  
        credentials: "include",  
        headers: {  
          'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(formData),  
      });  
  
      // Check for an HTTP error  
      if (!response.ok) {  
        throw new Error(`HTTP error! status: ${response.status}`);  
      }  
  
      const json = await response.json();  
  
      // Check if response is empty  
      if (!json || Object.keys(json).length === 0) {  
        throw new Error("Received an empty response from the server.");  
      }  
  
      console.log(json, "emp json");  
      console.log(formData, "yash formdata");  
      
      setEmpformdata([...empformdata, json.response]);
      router.push('/Empdashboard')  
    } catch (error) {  
      console.error("Error fetching employee data:", error); // Log any error message  
    }  
  }  

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8 mt-32">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Employee Profile</h2>
          
          <form onSubmit={Employeefetch} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => setCompanyname(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => setPhonenumber((e.target.value))}
                  placeholder="123-456-7890"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              >
                Submit Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}