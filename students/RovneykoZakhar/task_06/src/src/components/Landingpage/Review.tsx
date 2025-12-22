import { Star } from "lucide-react";

export function Review() {
    return(
        <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "John Doe",
                role: "Software Developer",
                content: "JobHub helped me find my dream job in just two weeks! The platform is so easy to use.",
              },
              {
                name: "Jane Smith",
                role: "Marketing Specialist",
                content:
                  "As an employer, I've found amazing talent through JobHub. It's our go-to platform for hiring.",
              },
              {
                name: "Alex Johnson",
                role: "UX Designer",
                content:
                  "The job alerts feature is fantastic. I got notified about my current job and applied immediately!",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}