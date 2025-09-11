"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OpenPDFs() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage.from("pdfs").list("");

      if (error) {
        console.error("Error fetching files:", error.message);
        return;
      }

      // Build public URLs
      const fileList = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(file.name);
        return { name: file.name, url: urlData.publicUrl };
      });

      setFiles(fileList);
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Available PDFs</h1>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.name} className="flex items-center justify-between">
            <span>{file.name}</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Open PDF
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
