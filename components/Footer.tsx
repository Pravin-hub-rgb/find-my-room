import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-8 py-2">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
        <p>
          Made with <span className="text-red-500">❤️</span> by <span className="font-medium">Vin</span> &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
