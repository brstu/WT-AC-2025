import React from 'react';  
import { Calendar, Clock, User } from 'lucide-react';  
import Image from 'next/image';

const blogPosts = [  
  {  
    title: "New Hybrid Job Location",  
    excerpt: "At the start of the Pandemic in 2020, our team quickly pivoted to add support for a new class of jobs Temporarily Remote. This was meant to be used for jobs that were remote but would eventually return to the office...",  
    author: "JobSync Team",  
    date: "February 3, 2023",  
    readTime: "3 min read",  
    imageUrl: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New updates to our API",  
    excerpt: "We've released a number of updates and enhancements to our Jobs API. More powerful search endpoint In addition to the existing support for query parameters the /api/v1/jobs/search end point, you can now simply append any url from your websites public...",  
    author: "JobSync Team",  
    date: "January 31, 2022",  
    readTime: "4 min read",  
    imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New Feature: Taxonomies",  
    excerpt: "Today we are excited to announce the launch of a powerful new feature to JobBoard.io customers – Taxonomies. Taxonomies allow you to categorize your jobs in powerful new ways to enhance job organization and discovery...",  
    author: "JobSync Team",  
    date: "October 13, 2020",  
    readTime: "5 min read",  
    imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New Feature: XML Exporter",  
    excerpt: "Today we are excited to announce the launch of our latest powerful new tool, our XML Exporter! XML is the de facto standard for exchanging job related data on the internet. While we've always provided you with standardized XML feeds...",  
    author: "JobSync Team",  
    date: "July 21, 2020",  
    readTime: "3 min read",  
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New and improved support for Remote Jobs",  
    excerpt: "In this unprecedented time, we all understand that Remote work is more important than ever before. Today, we're excited to launch a new suite of features designed to make the Remote experience on your job board better for Employers and Job Seekers...",  
    author: "JobSync Team",  
    date: "June 10, 2020",  
    readTime: "4 min read",  
    imageUrl: "https://images.unsplash.com/photo-1584931423298-c576fda54bd2?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New tools to combat spam postings",  
    excerpt: "We've rolled out some additional features to help you combat spam and other less desirable postings. As a Job Board operator, you can now blacklist certain domains or specific email addresses from creating Employer accounts...",  
    author: "JobSync Team",  
    date: "June 5, 2020",  
    readTime: "3 min read",  
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80"  
  },  
  {  
    title: "New Feature: Suggested Jobs",  
    excerpt: "Today we're excited to announce the launch of a brand new feature for Job Seekers: Suggested Jobs. With Suggested Jobs, our algorithms are able to understand what jobs your Job Seekers are searching for, viewing and applying to and pro-actively...",  
    author: "JobSync Team",  
    date: "May 5, 2020",  
    readTime: "3 min read",  
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"  
  }  
];  

export function Blogs() {  
  return (  
    <div className="min-h-screen bg-gray-50">  
      {/* Header */}  
      <header className="text-center py-8">  
        <h1 className="text-4xl font-bold">Blog Posts</h1>  
      </header>  

      {/* Blog Posts Grid */}  
      <div className="container mx-auto px-4 py-12">  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">  
          {blogPosts.map((post, index) => (  
            <div key={index}> {/* Using index as a key, ensuring it's unique */}  
              <article className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]">  
                <div className="h-48 overflow-hidden">  
                  <Image   
                    src={post.imageUrl}   
                    alt={post.title} 
                    width={500}
                    height={500}
                    
                    className="w-full h-full object-cover"  
                  />  
                </div>  
                <div className="p-6">  
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h2>  
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>  
                  <div className="flex items-center gap-4 text-sm text-gray-500">  
                    <div className="flex items-center gap-1">  
                      <User size={16} />  
                      <span>{post.author}</span>  
                    </div>  
                    <div className="flex items-center gap-1">  
                      <Calendar size={16} />  
                      <span>{post.date}</span>  
                    </div>  
                    <div className="flex items-center gap-1">  
                      <Clock size={16} />  
                      <span>{post.readTime}</span>  
                    </div>  
                  </div>  
                </div>  
              </article>  
            </div>  
          ))}  
        </div>  
      </div>  
    </div>  
  );  
}