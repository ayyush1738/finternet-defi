"use client";
import React, { FC } from "react";
import { cn } from "@/libs/utils";

// MagicButton.tsx
export const MagicButton = ({
    title, icon, position, handleClick, otherClasses,
    className,
}: {
    title: string;
    icon: React.ReactNode;
    position: string;
    handleClick?: () => void;
    otherClasses?: string;
    className?: string;
}) => {
    return (
        <div>
            <button
                className={`inline-flex h-12 w-full animate-shimmer items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-0 ${otherClasses} cursor-pointer`}
                onClick={handleClick}
            >
                {position === "left" && icon}
                {title}
                {position === "right" && icon}
            </button>

        </div>
    );
};


export default MagicButton;