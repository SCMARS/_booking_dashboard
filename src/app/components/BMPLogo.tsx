'use client';

import Link from 'next/link';

interface BMPLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BMPLogo({ className = '', showText = true, size = 'md' }: BMPLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg 
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64} 
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64} 
          viewBox="0 0 200 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="object-contain"
        >
          {/* Графический элемент - геометрическая сеть */}
          <g transform="translate(10, 10)">
            {/* Основной шестиугольник */}
            <path d="M20 5 L35 12.5 L35 27.5 L20 35 L5 27.5 L5 12.5 Z" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3" 
                  strokeLinejoin="round"/>
            
            {/* Дополнительные шестиугольники для создания 3D эффекта */}
            <path d="M20 5 L35 12.5 L30 20 L15 12.5 Z" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3" 
                  strokeLinejoin="round"/>
            
            <path d="M35 12.5 L35 27.5 L30 20 L30 15 Z" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3" 
                  strokeLinejoin="round"/>
            
            <path d="M35 27.5 L20 35 L15 27.5 L30 20 Z" 
                  fill="none" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3" 
                  strokeLinejoin="round"/>
            
            {/* Узлы соединения */}
            <circle cx="20" cy="5" r="3" fill="url(#gradient1)"/>
            <circle cx="35" cy="12.5" r="3" fill="url(#gradient1)"/>
            <circle cx="35" cy="27.5" r="3" fill="url(#gradient1)"/>
            <circle cx="20" cy="35" r="3" fill="url(#gradient1)"/>
            <circle cx="5" cy="27.5" r="3" fill="url(#gradient1)"/>
            <circle cx="5" cy="12.5" r="3" fill="url(#gradient1)"/>
            <circle cx="30" cy="20" r="3" fill="url(#gradient1)"/>
            <circle cx="15" cy="12.5" r="3" fill="url(#gradient1)"/>
          </g>
          
          {/* Текстовый элемент */}
          <g transform="translate(70, 15)">
            {/* Основной текст BMP */}
            <text x="0" y="25" 
                  fontFamily="Arial, sans-serif" 
                  fontSize="28" 
                  fontWeight="bold" 
                  fill="url(#gradient2)">
              BMP
            </text>
          </g>
          
          {/* Градиенты */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#8B5CF6', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#1E40AF', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#7C3AED', stopOpacity:1}} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-white ${
            size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-3xl' : 'text-4xl'
          }`}>
            BMP
          </span>
        </div>
      )}
    </Link>
  );
}
