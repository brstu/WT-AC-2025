"use client";
import React, { createContext, useContext, useState } from "react";
import { PersonalInfo } from "./PersonalInfo";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  gender: string;
}

interface AccountInfo {
  username: string;
  education: string;
  preferedJobTitle?: string;
  preferedLocation?: string;
  skills?: string;
  workingYear?: number;
  workingMonth?: number;
  links?: string;
  photoUrl?: string;
  resumeFile?: File;
}

interface FormData {
  personalInfo: PersonalInfo;
  accountInfo: AccountInfo;
}

interface FormContextType {
  formData: FormData;
  updatePersonalInfo: (data: PersonalInfo) => void;
  updateAccountInfo: (data: AccountInfo) => void;
}

const defaultFormData: FormData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    gender: "",
  },
  accountInfo: {
    username: "",
    education: "",
    preferedJobTitle: "",
    preferedLocation: "",
    skills: "", 
    workingYear: 0,
    workingMonth: 0,
    links: "",
  },
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  
  const updatePersonalInfo = (data: PersonalInfo) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: data,
    }));
  };

  const updateAccountInfo = (data: AccountInfo) => {  
    console.log('Submitting account info:', data);  // Log the incoming data  
    setFormData((prev) => ({  
      ...prev,  
      accountInfo: data,  
    }));  
  };

  return (
    <FormContext.Provider
      value={{ formData, updatePersonalInfo, updateAccountInfo }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
