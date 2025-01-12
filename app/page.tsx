import { Suspense } from 'react';
import Table from './ui/table'
import { AddGame } from './ui/buttons';

export default async function Page(props: {
  searchParams?: Promise<{
      query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

return (
  <div className="w-full">
    <div className="mt-4 ml-2 flex">
      <AddGame></AddGame>
    </div>
     <Suspense key={query}>
      <Table/>
    </Suspense>
  </div>
);
}
