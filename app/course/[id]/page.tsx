"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface Course {
  id: number;
  created_at: string;
  title: string;
  description: string;
  pdf_url: string | null;
}

export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setError("Supabase не е конфигуриран");
        setLoading(false);
        return;
      }

      try {
        // Fetch specific course from the Supabase table
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (error) {
          console.error("Error fetching course:", error.message);
          setError("Грешка при зареждане на курса");
          setLoading(false);
          return;
        }

        if (data) {
          setCourse(data);
        } else {
          setError("Курсът не е намерен");
        }
      } catch (error) {
        console.error("Error connecting to Supabase:", error);
        setError("Грешка при свързване с базата данни");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Грешка</h1>
            <p className="text-gray-600 mb-6">
              {error || "Курсът не е намерен"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
            >
              Назад към курсовете
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад към курсовете
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-blue-100 text-lg">
              Създаден на: {formatDate(course.created_at)}
            </p>
          </div>

          {/* Course Details */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Description Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Описание на курса
                </h2>
                <div className="prose prose-lg text-gray-700">
                  <p>{course.description}</p>
                </div>
              </div>

              {/* Course Information */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Информация за курса
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Дата на създаване
                    </h3>
                    <p className="text-gray-600">
                      {formatDate(course.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Section */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Материали за курса
                </h2>
                {course.pdf_url ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <svg
                        className="w-8 h-8 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-medium text-green-900 mb-1">
                          PDF материал налице
                        </h3>
                        <p className="text-green-700 text-sm">
                          Кликнете за да отворите материала за курса
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={course.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Отвори PDF материала
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <svg
                        className="w-8 h-8 text-yellow-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <div>
                        <h3 className="font-medium text-yellow-900 mb-1">
                          Няма наличен PDF материал
                        </h3>
                        <p className="text-yellow-700 text-sm">
                          Материалите за този курс ще бъдат добавени скоро
                        </p>
                      </div>
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
