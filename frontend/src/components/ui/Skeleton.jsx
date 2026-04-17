import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
    <div className="pt-4">
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className={`h-4 ${i === 0 ? 'w-32' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
