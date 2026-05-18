import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ErrorPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-200">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-slate-400 mb-8">Page not found</p>
      <Link to="/">
        <Button className="bg-white hover:bg-zinc-200 text-black border border-white/20 rounded-xl">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default ErrorPage;
