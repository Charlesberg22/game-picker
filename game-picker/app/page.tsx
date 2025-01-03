import Image from "next/image";
import { inter } from "./layout";
import { Suspense } from 'react';
import Table from './ui/table'

export default async function Page(props: {
  searchParams?: Promise<{
      query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

return (
  <div className="w-full">
    <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
    </div>
     <Suspense key={query}>
      <Table/>
    </Suspense>
  </div>
);
}
