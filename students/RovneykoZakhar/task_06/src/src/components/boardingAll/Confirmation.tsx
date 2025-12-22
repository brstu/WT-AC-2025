import React from 'react';
import { useFormContext } from './FormContext';
import { useRouter } from 'next/navigation';

import { toast, Toaster } from 'sonner';
import Image from 'next/image';

interface ConfirmationProps {
  onBack: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ onBack }) => {
  const { formData } = useFormContext();
  const { personalInfo, accountInfo } = formData;
    console.log(accountInfo,"yashacc");
    const router =useRouter();
    
    
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log();
      
   
      const response = await fetch('/api/stepper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
       console.log(response);
       
      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Handle successful submission
      console.log('Form submitted successfully',response);
      toast.success("Created User Profile successfully")
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Error creating user profile")
    }
  };
  console.log(formData,"yash data");
  

  return (
    <div className="mx-auto max-w-5xl">
        {/* {!session?.data?.user && (  */}
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Review Your Information</h2>
            <p className="text-sm text-gray-500">Please review your information before submitting.</p>

            <div className="mt-10 space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {personalInfo.firstName} {personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Street Address</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.streetAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">State / Province</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.state}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">ZIP / Postal Code</p>
                    <p className="mt-1 text-sm text-gray-900">{personalInfo.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Profile Photo</p>
                    <div className="mt-1 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      {accountInfo.photoUrl ? (
                        <Image
                          src={accountInfo.photoUrl}
                          alt="Profile"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <svg
                          className="h-10 w-10 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653Zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438ZM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Education</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.education}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">prefered Job Title</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.preferedJobTitle}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">prefered Job Location</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.preferedLocation}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Links</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.links}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Skills</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.skills}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Working Experience</p>
                    <p className="mt-1 text-sm text-gray-900">{accountInfo.workingMonth} {accountInfo.workingYear}</p>
                  </div>
                  {accountInfo.resumeFile && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Resume</p>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-400 mr-2"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V7.875L14.25 1.5H5.625zM7 7.875c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-3.75A1.125 1.125 0 017 9.375v-1.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {accountInfo.resumeFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="relative flex items-start pt-8 border-t border-gray-200">
                <div className="flex h-6 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="terms" className="font-medium text-gray-900">
                    I agree to the terms and conditions
                  </label>
                  <p className="text-gray-500">
                    By selecting this, you agree to our{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
     <Toaster richColors/>
    </div>
  );
};