export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4">
      <div className="text-center">
        <p className="text-xl font-semibold text-white">You are offline</p>
        <p className="mt-2 text-sm text-slate-300">
          Reconnect to load your orders.
        </p>
      </div>
    </div>
  );
}
