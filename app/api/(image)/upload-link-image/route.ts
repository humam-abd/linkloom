import { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  const { file } = await request.json();

  const uploadResult = await cloudinary.uploader
    .upload(file, { folder: "linkloom" })
    .catch((error) => {
      return Response.json({ message: `${error}` }, { status: 401 });
    });

  const optimizeUrl = cloudinary.url(
    (uploadResult as UploadApiResponse)?.public_id,
    {
      fetch_format: "auto",
      quality: "auto",
    }
  );

  return Response.json({
    message: "Image uploaded!",
    url: optimizeUrl,
    details: uploadResult,
  });
}
