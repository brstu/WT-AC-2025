"use client";

import Appbar from "@/components/Appbar/Appbar";
import { UserFullJobCard } from "@/components/UserFullJobCard";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Userjob() {
  const [userjob, setUserjob] = useState<Jobprop[]>([]);
  const params = useParams<{ id: string }>();
  const jobId = params?.id;
  console.log(jobId,'client job id');

  const fetchfulljob = async () => {
    try {
      console.log(`Fetching job from: /api/jobstream/${jobId}`);

      const res = await fetch(`/api/jobstream/${jobId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "Application/json",
        },
      });
      console.log(res, "yash res");

      if (!res.ok) {
        throw new Error(`Error fetching job: ${res.statusText}`);
      }

      const json = await res.json();
      
      console.log(json.job,"userjob id client side");
      
      setUserjob(json.job);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchfulljob();
  },[]);
  return (
    <div>
      <Appbar/>
      <UserFullJobCard job={userjob} />
    </div>
  );
}
