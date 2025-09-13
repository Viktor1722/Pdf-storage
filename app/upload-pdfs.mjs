import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import "dotenv/config";

// Load env vars from .env.local (adjust if needed)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client using the raw variables
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const pdfFolder = "./pdfs"; // folder with your Cyrillic-named PDFs
const bucket = "pdfs";

async function uploadPDFs() {
  const files = fs.readdirSync(pdfFolder).filter((f) => f.endsWith(".pdf"));

  for (const fileName of files) {
    const filePath = path.join(pdfFolder, fileName);
    const fileBuffer = fs.readFileSync(filePath);

    // Encode file name for storage
    const safeName = encodeURIComponent(fileName);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(safeName, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Failed to upload ${fileName}:`, uploadError.message);
      continue;
    }

    console.log(`✅ Uploaded ${fileName} as ${safeName}`);

    // Insert into DB
    const { error: insertError } = await supabase.from("pdfs").insert([
      {
        original_name: fileName,
        storage_key: safeName,
      },
    ]);

    if (insertError) {
      console.error(
        `⚠️ DB insert failed for ${fileName}:`,
        insertError.message
      );
    } else {
      console.log(`📥 DB entry added for ${fileName}`);
    }
  }
}

uploadPDFs();
