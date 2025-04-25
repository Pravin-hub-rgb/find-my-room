export default function Footer() {
    return (
      <footer className="bg-gray-100 border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <span className="font-medium">Find-My-Room</span>. All rights reserved.
          </p>
  
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="/about" className="hover:underline transition">About</a>
            <a href="/contact" className="hover:underline transition">Contact</a>
            <a href="/privacy" className="hover:underline transition">Privacy</a>
          </div>
        </div>
      </footer>
    )
  }
  