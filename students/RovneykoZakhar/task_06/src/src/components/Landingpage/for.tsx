import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function For() {
  const [isVisibleSeekers, setVisibleSeekers] = useState(false);
  const [isVisibleEmployers, setVisibleEmployers] = useState(false);

  const handleScroll = () => {
    const seekersSection = document.getElementById("job-seekers");
    const employersSection = document.getElementById("employers");

    if (seekersSection && employersSection) {
      const seekersPosition = seekersSection.getBoundingClientRect().top;
      const employersPosition = employersSection.getBoundingClientRect().top;

      // Change visibility based on scroll position
      setVisibleSeekers(seekersPosition < window.innerHeight);
      setVisibleEmployers(employersPosition < window.innerHeight);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-2">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Image
                src="https://media.istockphoto.com/id/1365133077/vector/flat-employment-agency-search-new-employees-to-hire.jpg?s=612x612&w=0&k=20&c=jjYOtMmneaIvKuG2hV2sMpFla7SEuzqhDG1wkJR1lCU="
                alt="Job Seekers" width={700} height={10}
              />
            </div>
            <div
              id="job-seekers"
              className={`p-8 ${isVisibleSeekers ? "animate-fade-in-up" : ""}`}
            >
              <h3 className="text-4xl font-bold mb-6">For Job Seekers</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Access Thousands of Job Listings: Explore a vast array of job
                  opportunities across various industries and locations tailored
                  to your skills and interests.
                </li>
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Create a Professional Profile: Stand out to employers by
                  showcasing your skills, experience, and achievements with a
                  polished, professional profile.
                </li>
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Network with Industry Professionals: Connect with recruiters
                  and other job seekers in your field, expanding your network
                  and opening up new opportunities.
                </li>
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
            <div
              id="employers"
              className={`p-8 ${
                isVisibleEmployers ? "animate-fade-in-down" : ""
              }`}
            >
              <h3 className="text-4xl font-bold mb-6">For Employers</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Post Job Openings Easily: Quickly create and publish job
                  listings with intuitive tools, reaching a wide audience of
                  potential candidates in just a few clicks.
                </li>
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Browse Candidate Profiles: Gain access to a diverse pool of
                  talent by browsing through candidate profiles that match your
                  job requirements and organizational culture.
                </li>
                <li className="flex items-center text-xl text-gray-600">
                  <ChevronRight className="w-10 h-10 text-emerald-600 mr-2" />
                  Manage Applications Efficiently: Track and manage all
                  applications in one centralized dashboard, making it easy to
                  sort, filter, and review candidates.
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Image
                src="https://img.freepik.com/premium-vector/professional-stick-figure-business-office-scene-with-male-female-colleagues-working-together_1324816-15438.jpg"
                alt="Employers" width={700} height={10}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
