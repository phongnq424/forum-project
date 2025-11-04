function LoadingScreen({}) {
  return (
    <div className="fixed f-full w-full inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="w-12 h-12 border-4 border-proPurple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingScreen;
