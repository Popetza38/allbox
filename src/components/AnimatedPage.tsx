import { motion, Transition } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedPageProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -20,
    },
};

const pageTransition: Transition = {
    duration: 0.3,
    ease: "easeInOut",
};

export function AnimatedPage({ children }: AnimatedPageProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
}
