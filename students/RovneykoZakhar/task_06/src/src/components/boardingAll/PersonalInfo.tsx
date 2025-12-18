import React from 'react';
import { useFormContext } from './FormContext';

interface PersonalInfoProps {
  onNext: () => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ onNext }) => {
  const { formData, updatePersonalInfo } = useFormContext();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
      
      
    updatePersonalInfo({
      firstName: formData.get('first-name') as string,
      lastName: formData.get('last-name') as string,
      email: formData.get('email') as string,
      country: formData.get('country') as string,
      streetAddress: formData.get('street-address') as string,
      city: formData.get('city') as string,
      state: formData.get('region') as string,
      gender: formData.get('gender') as string,
      postalCode: formData.get('postal-code') as string,
    });
    
    onNext();
    console.log(formData.get('gender'),"ll");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Personal Information</h2>
            <p className="text-sm text-gray-500">Use a permanent address where you can receive mail.</p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  First name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    defaultValue={formData.personalInfo.firstName}
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    defaultValue={formData.personalInfo.lastName}
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={formData.personalInfo.email}
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
              <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Gender
                    </label>
                    <div className="mt-2">
                      <select
                        id="gender"
                        name="gender"
                        defaultValue={formData.personalInfo.gender}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                      >
                        
                        <option >Male</option>
                        <option >Female</option>
                        <option >Other</option>
                      </select>
                    </div>
                  </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  Country
                </label>
                <div className="mt-2 relative">
                  <select
                    id="country"
                    name="country"
                    defaultValue={formData.personalInfo.country}
                    autoComplete="country-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-900">
                  Street address
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="street-address"
                    id="street-address"
                    defaultValue={formData.personalInfo.streetAddress}
                    autoComplete="street-address"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label className="block text-sm font-medium text-gray-900">
                  City
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    defaultValue={formData.personalInfo.city}
                    autoComplete="address-level2"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-900">
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="region"
                    id="region"
                    defaultValue={formData.personalInfo.state}
                    autoComplete="address-level1"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-900">
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="postal-code"
                    id="postal-code"
                    defaultValue={formData.personalInfo.postalCode}
                    autoComplete="postal-code"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};