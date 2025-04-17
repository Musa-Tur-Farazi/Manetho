import { Button } from "../ui/Button";
import { Search } from "lucide-react";
import Link from "next/link";
import LoginButton from "../ui/LoginButton";

export default function Navbar() {
  return (
    <nav className="w-full py-4 px-6 md:px-10 backdrop-blur-lg bg-white/10 border-b border-white/20 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">MedAdmit AI</h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                Study Tools
                <span className="ml-1">▼</span>
              </button>
            </div>

            <div className="relative group">
              <button className="py-2 px-3 text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                Subjects
                <span className="ml-1">▼</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="search"
              className="pl-10 pr-4 py-2 bg-gray-100/80 rounded-full w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Search for study materials, resources..."
            />
          </div>

          <Button variant="outline" className="hidden md:inline-flex">
            Create
          </Button>
          {/* <Button className="bg-blue-600 hover:bg-blue-700">Login</Button> */}
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
