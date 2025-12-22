import React from 'react';
import { MapPin, Building2, Mail, Globe, Briefcase, GraduationCap, Award } from 'lucide-react';

import Image from 'next/image';

interface UserCardProps {
  userdetail: UserProp;
}

export function UserCard({ userdetail }: UserCardProps) {
  // Convert skills string to array for rendering
  const skillsArray = userdetail.skills.split(',').map(skill => skill.trim());

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-32">
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0">
            <Image
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
              alt={`${userdetail.firstName} ${userdetail.lastName}`} width={400} height={400}
            />
          </div>

          {/* Main Info Section */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {userdetail.firstName} {userdetail.lastName}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{userdetail.resume}</p>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{userdetail.currentLocations}</span>
              </div>
            </div>

            {/* Contact & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userdetail.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-4 h-4" />
                <a
                  href={userdetail.links}
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Professional Profile
                </a>
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                  <Briefcase className="w-5 h-5" />
                  <h2>Experience</h2>
                </div>
                <p className="text-gray-600">
                  {userdetail.workingYear} years {userdetail.workingMonth} months
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                  <GraduationCap className="w-5 h-5" />
                  <h2>Education</h2>
                </div>
                <p className="text-gray-600">{userdetail.education}</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                <Award className="w-5 h-5" />
                <h2>Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Career Preferences */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Career Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Preferred Role</p>
                <p className="text-gray-900">{userdetail.preferedJobTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Preferred Location</p>
                <p className="text-gray-900">{userdetail.preferedLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-500">Full Address</p>
            <p>{userdetail.streetAddress}</p>
            <p>{userdetail.city}, {userdetail.state} {userdetail.postalCode}</p>
            <p>{userdetail.country}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Additional Information</p>
            <p>Username: {userdetail.username}</p>
            <p>Gender: {userdetail.gender}</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}