import React from 'react';

const SkeletonBar: React.FC<{ width: string; height?: string }> = ({ width, height = 'h-4' }) => (
    <div className={`bg-[--muted] rounded ${width} ${height}`}></div>
);

const SkeletonCard: React.FC = () => (
     <div className="bg-[--card] border border-[--border] rounded-2xl shadow-lg w-full overflow-hidden">
        <div className="p-8">
            <SkeletonBar width="w-3/4" height="h-7" />
            <div className="mt-4 space-y-2">
                <SkeletonBar width="w-full" />
                <SkeletonBar width="w-5/6" />
            </div>
            <div className="flex gap-6 my-6">
                <SkeletonBar width="w-24" height="h-6" />
                <SkeletonBar width="w-24" height="h-6" />
            </div>
            
            <hr className="border-[--border] my-6" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                    <SkeletonBar width="w-1/2" height="h-5" />
                    <SkeletonBar width="w-full" />
                    <SkeletonBar width="w-full" />
                    <SkeletonBar width="w-5/6" />
                </div>
                <div className="lg:col-span-8 space-y-4">
                    <SkeletonBar width="w-1/3" height="h-5" />
                    <SkeletonBar width="w-full" />
                    <SkeletonBar width="w-full" />
                    <SkeletonBar width="w-full" />
                    <SkeletonBar width="w-4/6" />
                </div>
            </div>
        </div>
    </div>
);


export const SkeletonLoader: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-8 animate-pulse">
           <SkeletonCard />
           <SkeletonCard />
           <SkeletonCard />
        </div>
    );
};