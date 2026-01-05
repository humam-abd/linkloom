import cloudinary from "@/lib/cloudinary";

export async function DELETE(request: Request) {
  const { publicId } = await request.json();

  await cloudinary.uploader.destroy(publicId).catch((error) => {
    return Response.json({ message: `${error}` }, { status: 401 });
  });

  return Response.json({ message: "Image deleted!" });
}
