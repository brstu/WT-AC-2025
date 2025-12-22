"use client";

import { useState } from "react";
import { SignInFlow } from "../../types/auth-types";

import SignUpCard from "./Signupcard";
import SignIncard from "./Signincard";

export default function AuthScreen({ authtype }: { authtype?: SignInFlow }) {
  const [FormType, setFormType] = useState<SignInFlow>(authtype || "signIn");

  return (
    <div>
      {FormType === "signIn" ? (
        <SignIncard setFormType={setFormType} />
      ) : (
        <SignUpCard setFormType={setFormType} />
      )}
    </div>
  );
}
