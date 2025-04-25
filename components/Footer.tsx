export default function Footer() {
    return (
      <footer className="bg-gray-100 border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          Made with <span className="text-red-500">❤️</span> by <span className="font-medium">Vin</span> &copy; {new Date().getFullYear()} Find-My-Room
        </div>
      </footer>
    )
  }
  