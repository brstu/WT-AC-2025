"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";

export function UserFullJobCard({ job }: { job: Jobprop }) {
  const [applyjob, setApplyjob] = useState<ApplicantProp[]>([]);
  const [resume, setResume] = useState("Dummy Resume Data");
  const [isHovered, setIsHovered] = useState(false);
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  async function applyfunction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = { resume };
      console.log(id,"yash id");
      
      const res = await fetch(`/api/applicant/appli/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorResponse = await res.text();
        throw new Error(`Network response was not ok: ${errorResponse}`);
      }

      const json = await res.json();
      setApplyjob([...applyjob, json.response]);
      toast.success("Successfully Applied")
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      toast.success("Error While Applying")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 my-24 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto transform transition-all duration-300 hover:scale-[1.02] bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-2 tracking-tight">
                {job.title}
              </CardTitle>
              <p className="text-emerald-50 text-lg font-medium">{job.company}</p>
            </div>
            <div className="hidden sm:block">
              <Briefcase className="w-12 h-12 text-emerald-100 opacity-50" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg transform transition-all duration-300 hover:scale-105">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-600">Job Type</h3>
                <p className="mt-1 text-lg font-semibold">{job.jobtype}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg transform transition-all duration-300 hover:scale-105">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-600">Salary</h3>
                <p className="mt-1 text-lg font-semibold">{job.salary / 100000} LPA</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg transform transition-all duration-300 hover:scale-105">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-600">Experience</h3>
                <p className="mt-1 text-lg font-semibold">{job.experience} years</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg transform transition-all duration-300 hover:scale-105">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-600">Location</h3>
                <p className="mt-1 text-lg font-semibold">{job.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-700 mb-4">
              Job Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-b from-white to-emerald-50 p-8 ">
          <form className="w-full space-y-6" onSubmit={applyfunction}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-700">
                Ready to Apply?
              </h2>
              <p className="text-emerald-600 mt-2">
                Submit your application below
              </p>
            </div>

            <div className="relative">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-emerald-600 mb-2"
              >
                Upload Resume <span className="text-red-500">*</span>
              </label>
              <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".pdf, .doc, .docx, .txt"
                  onChange={() => setResume("Dummy Resume Data (simulated upload)")}
                  className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 
                    file:text-sm file:font-semibold file:bg-emerald-600 file:text-white 
                    hover:file:bg-emerald-700 file:transition-colors file:duration-200
                    text-emerald-600 rounded-lg border-2 border-emerald-200 
                    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
                    transition-all duration-200"
                />
                {isHovered && (
                  <div className="absolute inset-0 bg-emerald-50 opacity-20 rounded-lg 
                    transition-opacity duration-200" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 
                hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-semibold
                rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 
                hover:-translate-y-1"
            >
              Submit Application
            </Button>
          </form>
        </CardFooter>
      </Card>
      <Toaster richColors/>
    </div>
  );
}