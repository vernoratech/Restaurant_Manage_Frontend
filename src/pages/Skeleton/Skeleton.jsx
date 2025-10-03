import React, { useEffect } from 'react';

const Skeleton = () => {
  const statCards = Array.from({ length: 4 });
  const tableRows = Array.from({ length: 6 });
  const activityItems = Array.from({ length: 4 });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-10 px-9">
      <div
        role="status"
        className="w-full space-y-10 animate-pulse"
        aria-label="Loading dashboard"
      >
        {/* Page header */}
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>

        {/* Stat cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((_, idx) => (
            <div
              key={`stat-${idx}`}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-8 w-32 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-100" />
                <div className="h-2 w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Table skeleton */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-6 w-40 rounded bg-gray-200" />
              <div className="h-10 w-44 rounded-full bg-gray-100" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
                <div className="h-4 rounded bg-gray-100" />
              </div>
              <div className="space-y-3">
                {tableRows.map((_, idx) => (
                  <div
                    key={`row-${idx}`}
                    className="h-12 rounded-lg bg-gray-50"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 h-6 w-36 rounded bg-gray-200" />
              <div className="space-y-4">
                {activityItems.map((_, idx) => (
                  <div key={`activity-${idx}`} className="space-y-3">
                    <div className="h-4 w-32 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-2 w-1/2 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 h-6 w-32 rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-10 rounded-lg bg-gray-100" />
                <div className="h-10 rounded-lg bg-gray-100" />
                <div className="h-10 rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Loading dashboard content...</span>
    </div>
  );
};

export default Skeleton;