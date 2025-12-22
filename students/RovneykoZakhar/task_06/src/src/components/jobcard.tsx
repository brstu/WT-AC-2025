"use client";

import Link from "next/link";
import {
  CalendarDays,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function JobCard({ userjob }: { userjob: Jobprop }) {
  console.log(userjob.id,"job card userjob.id");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTimeAgo = (date: any) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
        .replace("about ", "")
        .replace("less than ", "");
    } catch (error) {
      console.error(error);

      return "Invalid date";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Link href={`/userjob/${userjob.id}`}>
        <div
          key={userjob.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-emerald-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 ">
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-700">
                  {userjob.title}
                </h3>
                <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium whitespace-nowrap">
                  {userjob.jobtype}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{userjob.company}</span>
              </div>
            </div>

            {/* Company and Location */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-gray-600 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{userjob.experience}+ Exp</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{userjob.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{userjob.salary / 100000} Lacs</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">
              {userjob.description}
            </p>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-emerald-100">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" />
                Posted {formatTimeAgo(userjob.createdAt)}
              </div>

              <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
