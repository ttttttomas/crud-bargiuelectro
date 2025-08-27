import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="main flex flex-col items-center justify-center gap-10 md:flex-row">
      <Link
        className="flex size-82 items-center justify-center border-2 border-green-500 bg-green-500/50 px-10 text-black"
        href="/addproduct"
      >
        <p className="text-2xl font-bold italic">AGREGAR</p>
      </Link>
      <Link
        className="flex size-82 items-center justify-center border-2 border-orange-500 bg-orange-400/50 px-10 text-black"
        href="/updatecar"
      />
      <Link
        className="flex size-82 items-center justify-center border-2 border-red-500 bg-red-800/40 px-10 text-black"
        href="/deletecar"
      />
    </main>
  );
}
