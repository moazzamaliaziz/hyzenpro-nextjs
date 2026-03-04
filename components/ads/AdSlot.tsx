interface AdSlotProps {
    slot: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
}

export default function AdSlot({
    slot,
    format = 'auto',
    className = '',
}: AdSlotProps) {
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    if (!adsenseId) return null;

    return (
        <div className={`ad-container my-6 ${className}`} aria-label="Advertisement">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adsenseId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
                }}
            />
        </div>
    );
}
