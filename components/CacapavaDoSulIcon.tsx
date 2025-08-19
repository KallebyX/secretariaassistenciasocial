import React from 'react';

export const CacapavaDoSulIcon: React.FC<{className?: string}> = ({className}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200" 
        className={className}
        aria-label="Brasão de Caçapava do Sul"
    >
        <g>
            {/* Shield Outline */}
            <path d="M100 20 L30 60 V130 L100 180 L170 130 V60 Z" fill="#ffffff" stroke="#1945ab" strokeWidth="5" />
            
            {/* Blue Background */}
            <path d="M100 22 L32 61 V129 L100 178 L168 129 V61 Z" fill="#1945ab" />

            {/* Central Green Area */}
            <path d="M100 100 L40 125 V150 L100 175 L160 150 V125 Z" fill="#16a34a" />

            {/* Yellow Sun/Star */}
            <g transform="translate(100, 80) scale(0.3)">
                <path d="M0 -30 L10 -10 L30 0 L10 10 L0 30 L-10 10 L-30 0 L-10 -10 Z" fill="#facc15" />
                <circle cx="0" cy="0" r="8" fill="#1945ab" />
            </g>

            {/* Bottom Hills */}
            <path d="M40 125 C 60 110, 80 110, 100 125 C 120 110, 140 110, 160 125 L160 150 L40 150 Z" fill="#22c55e" opacity="0.7" />
        </g>
    </svg>
);
