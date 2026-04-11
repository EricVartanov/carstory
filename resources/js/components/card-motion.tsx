import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function CardMotion({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
