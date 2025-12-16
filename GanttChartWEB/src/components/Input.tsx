import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
    return (
        <input
            {...props}
            className={`w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-black ${className}`}
        />
    )
}

export default Input
