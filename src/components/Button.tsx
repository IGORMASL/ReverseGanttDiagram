import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
}

const Button: React.FC<ButtonProps> = ({ className = "", children, ...props }) => {
    return (
        <button
            {...props}
            className={`w-full bg-black text-white py-2 rounded-lg text-lg hover:bg-gray-800 transition ${className}`}
        >
            {children}
        </button>
    )
}

export default Button
