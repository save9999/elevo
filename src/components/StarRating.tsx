"use client";

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function StarRating({ stars, maxStars = 3, size = "md", animated = false }: StarRatingProps) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`${sizes[size]} ${i < stars ? "opacity-100" : "opacity-30"} ${animated && i < stars ? "animate-star-pop" : ""}`}
          style={animated && i < stars ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
