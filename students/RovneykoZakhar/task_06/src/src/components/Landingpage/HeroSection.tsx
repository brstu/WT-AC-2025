import Link from "next/link";
import { Button } from "../ui/button";
import { Features } from "./Features";
import { For } from "./for";
import { Review } from "./Review";
import Image from "next/image";


export function HeroSection(){
    return (
      <main className="flex-1">
      <div className="px-4 sm:px-10">
        <div className="min-h-[500px]">
          <div className=" grid md:grid-cols-2 justify-center items-center gap-10">
            <div className="max-md:order-1">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Your skills tell your story better than words
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                We collaborate with companies to strengthen their tech teams
                and assist candidates in finding career opportunities.
              </p>

              <div className="mt-10 px-6 flex items-center justify-start">
                <Link
                  href={{
                    pathname: "/auth",
                    query: {
                      authtype: "signUp",
                    },
                  }}
                >
                  <Button className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-6">
              <Image
                  src="https://static.vecteezy.com/system/resources/previews/001/879/474/non_2x/hiring-recruitment-design-job-vacancy-we-re-hiring-employee-open-vacancy-design-template-briefcase-and-email-cv-resume-jobs-career-illustration-for-business-card-banner-brochure-flyer-free-vector.jpg"
                  className=" " alt={""}  
                  width={700} height={10}            />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      <For />

      {/* Testimonials */}
      <Review />

      {/* CTA Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-emerald-50">
            Join thousands of professionals who&apos;ve found their dream jobs
            through our platform
          </p>
          <Link
            href={{
              pathname: "/auth",
              query: {
                authtype: "signUp",
              },
            }}
          >
            <Button className=" mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold text-emerald-500 shadow-lg hover:bg-emerald-100">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
    )
}