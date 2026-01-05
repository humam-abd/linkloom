import { Collection, CollectionInputType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export const useCollections = () => {
  const router = useRouter();
  const { id } = useParams();

  const queryClient = useQueryClient();

  const { mutate: createCollection } = useMutation({
    mutationFn: (body: Omit<Collection, "id">) =>
      fetch("/api/create-collection", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: (data) => router.push(`/draft/${data.id}`),
  });

  const { mutate: updateCollection } = useMutation({
    mutationFn: (body: CollectionInputType) =>
      fetch("/api/update-collection", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: (data) => console.log(data),
  });

  const { mutate: deleteCollection } = useMutation({
    mutationFn: (body: { id: string }) =>
      fetch("/api/delete-collection", {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-collections"],
      });
      router.push("/dashboard");
    },
  });

  const { data: existingCollection } = useQuery<Collection>({
    queryKey: ["get-collection-by-id", id],
    queryFn: () =>
      fetch("/api/get-collection-by-id", {
        method: "POST",
        body: JSON.stringify({ id: id }),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    select: (data) => data[0],
  });

  return {
    createCollection,
    updateCollection,
    deleteCollection,
    existingCollection,
  };
};
