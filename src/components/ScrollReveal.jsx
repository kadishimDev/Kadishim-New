import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Wraps children and animates them when they enter the viewport.
 * 
 * @param {ReactNode} children - Content to animate
 * @param {string} className - Additional classes
 * @param {number} delay - Animation delay in ms
 * @param {string} animation - Animation class (default: animate-fade-in-up)
 */
const ScrollReveal = ({ children, className = "", delay = 0, animation = "animate-fade-in-up" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Animate once
                }
            },
            { threshold: 0.1, rootMargin: "50px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} transition-all duration-700 ${isVisible ? `opacity-100 translate-y-0 ${animation}` : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
