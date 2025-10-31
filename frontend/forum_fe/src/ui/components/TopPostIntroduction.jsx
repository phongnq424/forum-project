import PostCard from "./PostCard";

export default function TopPostIntroduction() {
  const post = {
    title: "Post's Title",
    author: "Duong Thuan",
    likes: 100,
    comments: 201,
    avatar:
      "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/331137385_506405744991869_4667325644048908926_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEOFd3EBHOHpHlMJpn9E_8PaktXfLwwAiRqS1d8vDACJELkCUWRj0m9qE6FVA6nHdmj5qyqCLYCoP7CMHuVl4WW&_nc_ohc=gHZjwHzftrsQ7kNvwEKxDUX&_nc_oc=Adkn68VlK5vtjy0dv9f55jLXnSbtO_IrNUpwuPITVc7hteNSBf7WGwaMdUiH4q0sozA&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=qw4I4j144qtCfqLTo9AoMA&oh=00_AfcPl0s4_JwMYkECUbSc1E3JZ-YQWjhW2Y4q8U5R0y3QKg&oe=69095C9D",
  };
  return (
    <div className="w-full text-white bg-linear-(--linearGradient-1) py-[40px] flex items-center flex-col">
      <h1 className="text-[70px] font-bold inline-block bg-linear-(--linearGradient-2) text-transparent bg-clip-text">
        TOP POSTS
      </h1>
      <div className="flex w-full justify-center mt-[50px] ">
        <PostCard {...post}></PostCard>
      </div>

      <div className="flex h-[200px] w-full justify-center gap-[500px] relative top-[-200px] bg-transparent  pointer-events-none">
        <PostCard {...post}></PostCard>
        <PostCard {...post}></PostCard>
      </div>
      <div className=""></div>
    </div>
  );
}
