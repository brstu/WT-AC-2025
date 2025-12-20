import React, { useRef } from "react";
import { useFormContext } from "./FormContext";

interface AccountInfoProps {
  onNext: () => void;
  onBack: () => void;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ onNext,onBack }) => {
  const { formData, updateAccountInfo } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    updateAccountInfo({
      username: formData.get("username") as string,
      education: formData.get("education") as string,
      preferedJobTitle: formData.get("preferedJobTitle") as string,
      preferedLocation: formData.get("preferedLocation") as string,
      skills: formData.get("skills") as string,
      workingMonth: Number(formData.get("workingMonth")), // Ensure this is a number
      workingYear: Number(formData.get("workingYear")), // Ensure this is a number
      links: formData.get("links") as string, // Corrected from link to links
      resumeFile: fileInputRef.current?.files?.[0], // Assuming this is correct
    });
    
    
    onNext();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8"
      >
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile</h2>
            <p className="text-sm text-gray-500">
              Complete your profile information to continue.
            </p>

            <div className="mt-10 flex flex-col md:flex-row gap-8">
              {/* Left side - Photo */}
              <div className="md:w-1/3">
                <div className="sticky top-8">
                  <label className="block text-sm font-medium leading-6 text-gray-900 mb-4">
                    Profile Photo
                  </label>
                  <div className="flex flex-col items-center">
                    <div className="h-48 w-48 overflow-hidden rounded-full bg-gray-100 mb-4">
                      <svg
                        className="h-full w-full text-gray-300"
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
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors duration-200 w-full max-w-[200px]"
                    >
                      Change Photo
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Recommended: Square JPG, PNG. Max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Form fields */}
              <div className="md:w-2/3">
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Username
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        
                        <input
                          type="text"
                          name="username"
                          id="username"
                          defaultValue={formData.accountInfo.username}
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="janesmith"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Education
                    </label>
                    <div className="mt-2">
                      <select
                        id="education"
                        name="education"
                        defaultValue={formData.accountInfo.education}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="Choose a degree">Choose a degree</option>
                        <option value="B.Tech">
                          Bachelor of Technology (B.Tech)
                        </option>
                        <option value="B.E">
                          Bachelor of Engineering (B.E)
                        </option>
                        <option value="M.Tech">
                          Master of Technology (M.Tech)
                        </option>
                        <option value="M.E">Master of Engineering (M.E)</option>
                        <option value="Integrated B.Tech + M.Tech">
                          Integrated B.Tech + M.Tech
                        </option>
                        <option value="B.Sc Computer Science">
                          Bachelor of Science in Computer Science
                        </option>
                        <option value="M.Sc Computer Science">
                          Master of Science in Computer Science
                        </option>
                        <option value="Diploma in Engineering">
                          Diploma in Engineering/Technology
                        </option>
                        <option value="BCA">
                          Bachelor of Computer Applications (BCA)
                        </option>
                        <option value="MCA">
                          Master of Computer Applications (MCA)
                        </option>
                        <option value="Data Science">
                          Bachelor of Data Science
                        </option>
                        <option value="Cybersecurity">
                          Bachelor of Cybersecurity
                        </option>
                        <option value="Robotics">Bachelor of Robotics</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Prefered Job Title
                    </label>
                    <div className="mt-2">
                      <input
                        name="preferedJobTitle"
                        id="PreferedJobTitle"
                        defaultValue={formData.accountInfo.preferedJobTitle}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                      ></input>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Prefered Job Location
                    </label>
                    <div className="mt-2">
                      <input
                        name="preferedLocation"
                        id="preferedLocation"
                        defaultValue={formData.accountInfo.preferedLocation}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                      ></input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Working Experience
                    </label>
                    <div className="mt-2 flex items-center">
                      <div className="mr-4 flex">
                        <label className="block text-sm font-medium text-gray-900 px-4">
                          Months
                        </label>
                        <select
                          id="workingMonth"
                          name="workingMonth"
                          defaultValue={formData.accountInfo.workingMonth}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                        </select>
                      </div>
                      <div className="flex">
                        <label className="block text-sm font-medium text-gray-900  px-4">
                          Years
                        </label>
                        <select
                          id="workingYear"
                          name="workingYear"
                          defaultValue={formData.accountInfo.workingYear}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>{" "}
                          {/* You can extend this if needed */}
                        </select>
                      </div>
                    </div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Skills
                    </label>
                    <div className="mt-2">
                      <input
                        name="skills"
                        id="skills"
                        defaultValue={formData.accountInfo.skills}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                      ></input>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Links
                    </label>
                    <div className="mt-2">
                      <input
                        name="links"
                        id="links"
                        defaultValue={formData.accountInfo.links}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                      ></input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Resume <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 hover:border-gray-400 transition-colors duration-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              ref={fileInputRef}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600 mt-1">
                          PDF, Docx up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
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
              className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
