import { ImageDataResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useImage = (
  handleSuccess?: (imageData: ImageDataResponse) => void,
  handleDelete?: () => void
) => {
  const { mutate: uploadImage, isPending: isUploadingImage } = useMutation({
    mutationFn: (body: { file: string }) =>
      fetch("/api/upload-link-image", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: (data) => handleSuccess?.(data),
  });

  const { mutate: deleteImage, isPending: isDeletingImage } = useMutation({
    mutationFn: (body: { publicId: string }) =>
      fetch("/api/delete-link-image", {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () => handleDelete?.(),
  });

  return { uploadImage, isUploadingImage, deleteImage, isDeletingImage };
};
