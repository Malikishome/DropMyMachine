import React from "react";

function FloatingInput({ label, type = "text", name, value, onChange }) {
    return (
        <div className="relative z-0 w-full">
            <input type={type}
                id={name}
                placeholder=" "
                value={value}
                onChange={onChange}
                className="peer w-full border border-gray-400 px-3 pt-6 pb-2 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors duration-200" />

                <label 
                htmlFor={name}
                className="absolute left-3 top-4 text-gray-500 transition-all duration-200 ease-in-out
                peer-focus:top-[7px] peer-focus:text-[11px] peer-focus:text-blue-500 peer-focus:font-medium
                peer-[:not(:placeholder-shown)]:top-[7px] peer-[not(:placeholder-shown)]:text-[11px] peer-[not(:placeholder-shown)]:text-gray-500 peer-[not(:placeholder-shown)]:font-medium">
                    {label}
                    </label>
        </div>

    );
}

export default FloatingInput;