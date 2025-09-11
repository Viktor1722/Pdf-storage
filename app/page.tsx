"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface Course {
  id: string;
  name: string;
  description: string;
  pdfUrl?: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log("Supabase not configured, showing sample courses");
        setCourses(sampleCourses);
        return;
      }

      try {
        const { data, error } = await supabase.storage.from("pdfs").list("");

        if (error) {
          console.error("Error fetching files:", error.message);
          // Show sample courses if error occurs
          setCourses(sampleCourses);
          return;
        }

        // Convert PDF files to courses
        const courseList = data.map((file: { name: string }, index: number) => {
          const { data: urlData } = supabase.storage
            .from("pdfs")
            .getPublicUrl(file.name);

          return {
            id: `course-${index}`,
            name: file.name
              .replace(".pdf", "")
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            description: `Learn about ${file.name
              .replace(".pdf", "")
              .replace(/[-_]/g, " ")
              .toLowerCase()} with this comprehensive course material.`,
            pdfUrl: urlData.publicUrl,
          };
        });

        // If no files, show sample courses
        setCourses(courseList.length > 0 ? courseList : sampleCourses);
      } catch (error) {
        console.error("Error connecting to Supabase:", error);
        setCourses(sampleCourses);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Centered Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Курсове</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Тук можете да намерите всички курсове, които сме разработили за вас.
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {course.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>
                {course.pdfUrl && (
                  <a
                    href={course.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Open Course Material
                  </a>
                )}
                {!course.pdfUrl && (
                  <button className="inline-flex items-center justify-center w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-md cursor-not-allowed">
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sample courses for demonstration
const sampleCourses: Course[] = [
  {
    id: "1",
    name: "Introduction to Web Development",
    description:
      "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners looking to start their coding journey.",
  },
  {
    id: "2",
    name: "React.js Masterclass",
    description:
      "Master React.js with hands-on projects and real-world examples. Build modern, interactive web applications from scratch.",
  },
  {
    id: "3",
    name: "Database Design Principles",
    description:
      "Understand database design concepts, normalization, and best practices for creating efficient and scalable database systems.",
  },
  {
    id: "4",
    name: "UI/UX Design Fundamentals",
    description:
      "Learn the principles of user interface and user experience design. Create beautiful and intuitive digital experiences.",
  },
  {
    id: "5",
    name: "Python for Data Science",
    description:
      "Explore data analysis and visualization using Python. Learn pandas, matplotlib, and other essential data science libraries.",
  },
  {
    id: "6",
    name: "Mobile App Development",
    description:
      "Build native mobile applications for iOS and Android. Learn the latest development tools and best practices.",
  },
];
