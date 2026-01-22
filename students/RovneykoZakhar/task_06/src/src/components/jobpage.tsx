"use client";

import type React from "react";
import { ChevronDown, ChevronUp, Clock, Briefcase, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { JobCard } from "./jobcard";

export function Jobs() {
  const [selectedSalaries, setSelectedSalaries] = useState<SalaryRange[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobTypeRange[]>([]);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isJobTypeOpen, setIsJobTypeOpen] = useState(false);
  const [experience, setExperience] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [alljob, setAlljob] = useState<Jobprop[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Jobprop[]>([]);

  const salaryRanges: SalaryRange[] = [
    { label: "0 - 3 Lakh", min: 0, max: 3 },
    { label: "3 - 6 Lakh", min: 3, max: 6 },
    { label: "6 - 10 Lakh", min: 6, max: 10 },
    { label: "10 - 15 Lakh", min: 10, max: 15 },
  ];

  const jobTypeRanges: JobTypeRange[] = [
    { label: "FullTime" },
    { label: "PartTime" },
    { label: "Contract" },
    { label: "Freelance" },
  ];

  async function refreshjobs() {
    try {
      const res = await fetch("/api/jobstream", {
        method: "GET",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });
      const json = await res.json();

      if (Array.isArray(json.job)) {
        setAlljob(json.job);
        setFilteredJobs(json.job);
      } else {
        setAlljob([]);
        setFilteredJobs([]);
      }
    } catch (e) {
      console.error(e);
      setAlljob([]);
      setFilteredJobs([]);
    }
  }

  useEffect(() => {
    refreshjobs();
  }, []);

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExperience(Number(e.target.value));
  };

  const formatExperience = (value: number) => {
    return value === 12 ? "12+" : value.toString();
  };

  const toggleJobType = (jobType: JobTypeRange) => {
    setSelectedJobTypes((prev) =>
      prev.some((t) => t.label === jobType.label)
        ? prev.filter((t) => t.label !== jobType.label)
        : [...prev, jobType]
    );
  };

  const toggleSalary = (range: SalaryRange) => {
    setSelectedSalaries((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  useEffect(() => {
    const hasActiveFilters =
      search.trim() !== "" ||
      selectedSalaries.length > 0 ||
      selectedJobTypes.length > 0 ||
      experience > 0;

    if (!hasActiveFilters) {
      setFilteredJobs(alljob);
      return;
    }

    let filtered = [...alljob];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedSalaries.length > 0) {
      filtered = filtered.filter((job) =>
        selectedSalaries.some(
          (range) =>
            job.salary / 100000 >= range.min && job.salary / 100000 <= range.max
        )
      );
    }

    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter((job) =>
        selectedJobTypes.some((type) => job.jobtype === type.label)
      );
    }

    if (experience > 0) {
      filtered = filtered.filter((job) => job.experience <= experience);
    }

    setFilteredJobs(filtered);
  }, [selectedJobTypes, selectedSalaries, experience, search, alljob]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Fixed Header */}
      <div className="fixed top-[80px] left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-20 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Find Your Next Opportunity
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the perfect job that matches your skills and aspirations
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-emerald-100 blur-lg opacity-30 rounded-2xl"></div>
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-white border-2 border-emerald-100 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 relative z-10"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5 z-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[310px] pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 items-start relative">
            {/* Fixed Filters Panel */}
            <div className="w-80 flex-shrink-0">
              <div className="fixed w-80 top-80 bottom-8 overflow-auto pr-4 pb-8 hide-scrollbar">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-50">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Filters
                  </h2>

                  {/* Salary Filter */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setIsSalaryOpen((prev) => !prev)}
                      className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl shadow-sm flex items-center justify-between text-gray-700 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">
                          {selectedSalaries.length
                            ? `${selectedSalaries.length} Selected`
                            : "Salary Range"}
                        </span>
                      </div>
                      {isSalaryOpen ? (
                        <ChevronUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>

                    {isSalaryOpen && (
                      <div className="mt-2 bg-white border-2 border-emerald-50 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-3">
                          {salaryRanges.map((range) => (
                            <label
                              key={range.label}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors duration-150"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSalaries.includes(range)}
                                onChange={() => toggleSalary(range)}
                                className="w-5 h-5 border-2 border-emerald-300 rounded-md text-emerald-600 focus:ring-emerald-500 checked:bg-emerald-600 checked:border-transparent transition-colors duration-200"
                              />
                              <span className="text-gray-700 font-medium">
                                {range.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Job Type Filter */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setIsJobTypeOpen(!isJobTypeOpen)}
                      className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl shadow-sm flex items-center justify-between text-gray-700 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">
                          {selectedJobTypes.length
                            ? `${selectedJobTypes.length} Selected`
                            : "Job Type"}
                        </span>
                      </div>
                      {isJobTypeOpen ? (
                        <ChevronUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>

                    {isJobTypeOpen && (
                      <div className="mt-2 bg-white border-2 border-emerald-50 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-3">
                          {jobTypeRanges.map((jobtype) => (
                            <label
                              key={jobtype.label}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors duration-150"
                            >
                              <input
                                type="checkbox"
                                checked={selectedJobTypes.some(
                                  (t) => t.label === jobtype.label
                                )}
                                onChange={() => toggleJobType(jobtype)}
                                className="w-5 h-5 border-2 border-emerald-300 rounded-md text-emerald-600 focus:ring-emerald-500 checked:bg-emerald-600 checked:border-transparent transition-colors duration-200"
                              />
                              <span className="text-gray-700 font-medium">
                                {jobtype.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Experience Filter */}
                  <div className="bg-white border-2 border-emerald-100 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-900 font-medium">
                        Experience (Years)
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="12"
                          step="1"
                          value={experience}
                          onChange={handleExperienceChange}
                          className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />

                        <div className="flex justify-between px-1 mt-2">
                          {[...Array(13)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-0.5 h-2 bg-emerald-200"></div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between mt-1">
                          <span className="text-sm font-medium text-gray-600">
                            0
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            12+
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="bg-emerald-100 px-6 py-2 rounded-full">
                          <span className="text-sm text-emerald-800 font-semibold">
                            {formatExperience(experience)}{" "}
                            {experience === 1 ? "Year" : "Years"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Job Listings */}
            <div className="flex-1">
              <div className="space-y-6">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} userjob={job} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border-2 border-emerald-50 shadow-xl">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        No Matching Jobs Found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        We couldn&apos;t find any jobs matching your current
                        filters. Try adjusting your search criteria or explore
                        different options.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedSalaries([]);
                          setSelectedJobTypes([]);
                          setExperience(0);
                          setSearch("");
                        }}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
