import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 bg-primary text-white font-bold rounded-lg">MJ</div>
      <span className="font-bold text-lg uppercase tracking-wide">MJ&apos;s Haven</span>
    </Link>
  )
}

