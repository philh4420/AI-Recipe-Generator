import React from 'react';

const SkeletonBar: React.FC<{ width: string; height?: string }> = ({ width, height = 'h-4' }) => (
    <div className={`bg-[--muted] rounded ${width} ${height}`}></div>
);

const SkeletonCard: React.FC = () => (
     <div className="bg-[--card] p-8 rounded-2xl shadow-lg w-full">
        <SkeletonBar width="w-3/5" height="h-7" />
        <div className="mt-4 space-y-2">
            <SkeletonBar width="w-full" />
            <SkeletonBar width="w-4/6" />
        </div>
        <div className="flex gap-4 my-6">
            <SkeletonBar width="w-1/2" height="h-10" />
            <SkeletonBar width="w-1/2" height="h-10" />
        </div>
        <SkeletonBar width="w-1/3" height="h-6" />
         <div className="mt-4 space-y-3">
            <SkeletonBar width="w-full" />
            <SkeletonBar width="w-5/6" />
            <SkeletonBar width="w-full" />
        </div>
    </div>
);


export const SkeletonLoader: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
           <SkeletonCard />
           <SkeletonCard />
           <SkeletonCard />
        </div>
    );
};