"use client"
import React, { useState } from 'react';
import { Building2, MapPin, Briefcase, DollarSign, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { toast, Toaster } from 'sonner';
import { Input } from '../ui/input';



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Empjobpost({onJobCreated} : {onJobCreated:any}) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostJobprop>({
    title: '',
    description: '',
    company: '',
    jobtype: "",
    location: '',
    salary: 0,
    experience:0,
    createdAt:new Date()
  });
  console.log(formData,"yash before try");
  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
   
    // TODO: Implement job posting logic
    try{
        console.log("Form data before submission:", formData); 
        const res = await fetch('/api/jobstream',{
            method:"POST",
            credentials:"include",
            headers:{
                'Content-Type': 'Application/json'
            },
            body:JSON.stringify(formData)
        });
        
        if (!res.ok) {  
            const errorJson = await res.json(); // Get the error message  
            throw new Error(errorJson.error || "Failed to post the job.");  
        }  

        const json = await res.json();
        onJobCreated(json)
        toast.success("Job added successfully")
        console.log(json, "yash emp json");     
        setFormData({ 
            
            title: '',  
            description: '',  
            company: '',  
            jobtype: '', // Reset to empty array  
            location: '',  
            salary: 0, 
            experience:0, 
            createdAt:new Date()
          }); 
       

          router.push(`/empjob/${json.id}`);
    }catch(e){
        console.error(e);

        console.log("error 500"); 
        toast.error("Error while adding job")  
        // throw new Error(e);   
    }  
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          
          
          <form onSubmit={handleSubmit}   className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="w-4 h-4" />
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="w-4 h-4" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Tech Corp Inc."
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4" />
                  Job Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4" />
                    Job Type
                  </label>
                  <select
                    name="jobtype"
                    value={formData.jobtype}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Job Type</option>
                    <option value="FullTime">Full-time</option>
                    <option value="PartTime">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. New York, NY"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Salary
                  </label>
                  <Input
                    type="Number"
                    name="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 100000"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}  
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
               
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster richColors/>
    </div>
  );
}