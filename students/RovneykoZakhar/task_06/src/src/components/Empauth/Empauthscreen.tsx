"use client";

import { useState } from "react";
import { SignInFlow } from "../../types/auth-types";
import EmpSignIncard from "./EmpSignin";
import EmpSignUpcard from "./EmpSignup";



export default function Empauthscreen({ authtype }: { authtype?: SignInFlow }) {
  const [FormType, setFormType] = useState<SignInFlow>(authtype || "signIn");

  return (
    <div>
      {FormType === "signIn" ? (
        <EmpSignIncard setFormType={setFormType} />
      ) : (
        <EmpSignUpcard setFormType={setFormType} />
      )}
    </div>
  );
}
