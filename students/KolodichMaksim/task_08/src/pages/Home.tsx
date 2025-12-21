import { useState } from 'react';
import CourseList from '../components/CourseList';
import SearchFilter from '../components/SearchFilter';
import coursesData from '../data/courses.json';
import { Course } from '../types';

export default function Home() {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(coursesData);

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    setFilteredCourses(
      coursesData.filter((c) => c.title.toLowerCase().includes(lowerQuery))
    );
  };

  const handleCategory = (category: string) => {
    if (!category) {
      setFilteredCourses(coursesData);
    } else {
      setFilteredCourses(coursesData.filter((c) => c.category === category));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Каталог курсов</h1>
      <SearchFilter onSearch={handleSearch} onCategory={handleCategory} />
      <CourseList courses={filteredCourses} />
    </div>
  );
}