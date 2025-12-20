import { Jobprop } from "@/types";
import { Briefcase, IndianRupee, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Empjobcard() {
  const [jobs, setJobs] = useState<Jobprop[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobstream", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "Application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch jobs");

        const json = await res.json();
        console.log("Fetched jobs:", json.job); // Debugging log

        if (json.job && Array.isArray(json.job)) {
          setJobs(json.job);
        } else {
          setJobs([]); // Ensure jobs is always an array
        }
      } catch (e) {
        console.error("Error fetching jobs:", e);
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="text-emerald-800 text-lg font-medium">
              Loading jobs...
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
              {jobs.map((empjob) => (
                <div key={empjob.id} className="w-full">
                  <Link
                    href={{
                      pathname: `/empjob/${empjob.id}`,
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100 transition-all duration-300 hover:shadow-lg hover:border-emerald-300">
                      <div className="p-6">
                        <div className="flex justify-between">
                        <div>
                        <h3 className="text-xl font-semibold truncate">
                          {empjob.title}
                        </h3>
                        <div className="text-sm mt-1 font-medium">
                          {empjob.company}
                        </div>
                        <p className="text-gray-600 mt-4 line-clamp-3">
                          {empjob.description}
                        </p>
                        </div>
                        <div className="mb-2 sm:mb-0">
                            <span>
                              {Array.isArray(empjob.jobtype)
                                ? empjob.jobtype.join(", ")
                                : empjob.jobtype}
                            </span>
                          </div>
                          </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-emerald-100">
                        <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-gray-600 text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{empjob.experience}+ Exp</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{empjob.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{empjob.salary / 100000} Lacs</span>
                          </div>
                        </div>
                       
                          
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-emerald-800 text-lg font-medium">
                No jobs available at the moment
              </div>
              <p className="text-emerald-600 mt-2">
                Check back later for new opportunities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
