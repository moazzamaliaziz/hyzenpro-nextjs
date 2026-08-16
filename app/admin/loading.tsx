export default function AdminLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-64 bg-white/10 rounded" />
            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-white/10 rounded-xl" />
                ))}
            </div>
            <div className="h-64 bg-white/10 rounded-xl" />
        </div>
    );
}
