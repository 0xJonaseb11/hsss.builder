import Image from "next/image";
import Link from "next/link";

type AppBrandProps = {
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  linkTo?: string;
  size?: "sm" | "md";
};

export function AppBrand({
  variant = "dark",
  showSubtitle = true,
  linkTo,
  size = "md",
}: AppBrandProps) {
  const titleClass =
    size === "sm" ? "text-lg font-bold tracking-tight" : "text-2xl font-bold tracking-tight";
  const subtitleClass = size === "sm" ? "text-xs" : "text-sm";

  const content = (
    <div className="flex items-center gap-3">
      <Image
        src="/icon-192.png"
        alt=""
        width={size === "sm" ? 36 : 44}
        height={size === "sm" ? 36 : 44}
        className="rounded-lg"
        priority
      />
      <div className="text-left">
        <p
          className={`${titleClass} ${
            variant === "light" ? "text-white" : "text-cyan"
          }`}
        >
          HSSS
        </p>
        {showSubtitle && (
          <p
            className={`${subtitleClass} ${
              variant === "light" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Builder ordering
          </p>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-flex transition opacity-90 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
