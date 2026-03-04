"use client";

import { useEffect, useRef } from "react";

interface Props { score: number; size?: number }

export function ScoreRing({ score, size = 160 }: Props) {
    const radius = (size - 20) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
    const label = score >= 70 ? "Strong" : score >= 50 ? "Moderate" : "At Risk";

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ffffff08" strokeWidth={10} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000"
                    style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-neutral-500 mt-1">{label}</span>
            </div>
        </div>
    );
}
