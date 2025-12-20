import { Briefcase, Building2, CircleUser, Database, Network, Users } from "lucide-react";

const features = [
  {
    icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
    title: "Thousands of Jobs",
    description: "Access to countless opportunities across various industries",
  },
  {
    icon: <Building2 className="h-6 w-6 text-emerald-500" />,
    title: "Top Companies",
    description: "Partner with leading companies worldwide",
  },
  {
    icon: <Network className="h-6 w-6 text-emerald-500" />,
    title: "Professional Network",
    description: "Connect with industry professionals and grow your network",
  },
  {
    icon: <Users className="h-6 w-6 text-emerald-500" />,
    title: "Multiple Job Boards",
    description: "Easily manage and switch between multiple Job Boards from a single login.",
  },
  {
    icon: <Database className="h-6 w-6 text-emerald-500" />,
    title: "Profile Database",
    description: " Run your own candidate profile database and charge employers for access.",
  },
  {
    icon: <CircleUser className="h-6 w-6 text-emerald-500" />,
    title: "Employer Profiles",
    description: "Employer Profiles Employers can register with your job board and seamlessly manage all of their job postings, view stats and see all their applicants from a single dashboard.",
  },
];


export function Features(){
    return(
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div>
            <h2 className="text-4xl font-bold text-center mb-2">Features</h2>
            <h4 className="text-lg text-center mb-12 text-gray-500 ">Job Board Software, the way the it should be focused, with great features and reasonable pricing.</h4>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
    )
}