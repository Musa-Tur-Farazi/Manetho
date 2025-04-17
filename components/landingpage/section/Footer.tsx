import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-10 px-6 md:px-10 backdrop-blur-lg bg-white/5 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              Gyanet
            </h2>
            <p className="text-gray-600 mb-4">
              Your AI-powered companion for medical school admissions success.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Study Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Flashcards
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Progress Tracking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Subjects</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  MCAT Prep
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Biology
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Biochemistry
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Anatomy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 Gyanet. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="/"
              className="text-gray-500 hover:text-blue-600 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:text-blue-600 text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;