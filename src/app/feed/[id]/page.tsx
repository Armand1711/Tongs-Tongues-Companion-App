import { MY_ENTRY_ID, POSTS } from "@/lib/demo/data";
import { PostDetail } from "@/components/post-detail";

export function generateStaticParams() {
  return [...POSTS.map((post) => post.id), MY_ENTRY_ID].map((id) => ({ id }));
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetail id={id} />;
}
