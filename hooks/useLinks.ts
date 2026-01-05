import { LinkItemInputType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useLinks = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { mutate: createLink } = useMutation({
    mutationFn: (body: LinkItemInputType) =>
      fetch("/api/create-link", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get-collection-by-id", id],
      }),
  });

  const { mutate: deleteLink } = useMutation({
    mutationFn: (body: { id: string }) =>
      fetch("/api/delete-link", {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get-collection-by-id", id],
      }),
  });

  const { mutate: updateLink } = useMutation({
    mutationFn: (body: { id: string }) =>
      fetch("/api/update-link", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get-collection-by-id", id],
      }),
  });

  return { createLink, updateLink, deleteLink };
};
