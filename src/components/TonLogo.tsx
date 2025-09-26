import { cn } from "@/lib/utils";

interface TonLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function TonLogo({ className, size = "md" }: TonLogoProps) {
  const sizeClasses = {
    sm: "w-16 h-6",
    md: "w-24 h-9", 
    lg: "w-32 h-12",
    xl: "w-48 h-18"
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <svg 
        className={cn(sizeClasses[size], "transition-all duration-300 filter drop-shadow-lg hover:drop-shadow-xl")} 
        viewBox="0 0 147 56" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_118_2651)">
          <circle cx="28.17" cy="28" r="28" fill="url(#tonGradient)" />
          <path 
            d="M37.7257 15.6277H18.604C15.0882 15.6277 12.8599 19.4202 14.6286 22.4861L26.4298 42.9409C27.1999 44.2765 29.1298 44.2765 29.8999 42.9409L41.7035 22.4861C43.4699 19.4251 41.2415 15.6277 37.7281 15.6277H37.7257ZM26.4202 36.8068L23.8501 31.8327L17.6487 20.7414C17.2396 20.0315 17.7449 19.1218 18.6016 19.1218H26.4178V36.8092L26.4202 36.8068ZM38.6762 20.739L32.4772 31.8351L29.9071 36.8068V19.1194H37.7233C38.58 19.1194 39.0853 20.0291 38.6762 20.739Z" 
            fill="white" 
          />
          <path 
            d="M73.8158 43.4675H80.0872V21.5962H88.7587V15.6384H65.144V21.5962H73.8158V43.4675Z" 
            fill="url(#textGradient)" 
          />
          <path 
            d="M103.831 43.9378C111.748 43.9378 118.216 37.4705 118.216 29.5529C118.216 21.6354 111.748 15.168 103.831 15.168C95.874 15.168 89.4459 21.6354 89.4459 29.5529C89.4459 37.4705 95.874 43.9378 103.831 43.9378ZM103.831 37.9016C99.284 37.9016 95.7172 34.0604 95.7172 29.5529C95.7172 25.0454 99.284 21.2042 103.831 21.2042C108.338 21.2042 111.905 25.0454 111.905 29.5529C111.905 34.0604 108.338 37.9016 103.831 37.9016Z" 
            fill="url(#textGradient)" 
          />
          <path 
            d="M146.835 43.4675V15.6384H140.563V32.8062L127.041 15.6384H121.671V43.4675H127.903V26.2605L141.465 43.4675H146.835Z" 
            fill="url(#textGradient)" 
          />
        </g>
        <defs>
          <linearGradient id="tonGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0098EA" />
            <stop offset="50%" stopColor="#0088D1" />
            <stop offset="100%" stopColor="#0066AA" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--foreground))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" />
          </linearGradient>
          <clipPath id="clip0_118_2651">
            <rect width="147" height="56" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}