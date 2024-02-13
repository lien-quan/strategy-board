import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <div className="w-[20%] bg-green-100 fixed h-screen">
        <div className="text-center p-4">
          <Link href="/hero-comparison">
            <div className="text-lg font-bold">Hero Comparison</div>
          </Link>
          {/* Add more links here as needed */}
        </div>
      </div>
      <div className="w-[80%] ml-[20%] bg-gray-100">
        {children} {/* Content will be rendered here */}
      </div>
    </div>
  );
}
