import React from 'react';

const Signature = () => {
    return (
        <a
            href="https://www.linkedin.com/in/jeremiasmarturano/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] transition-transform hover:scale-105"
        >
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3 hover:bg-white/80 transition-colors">
                <img
                    src="/logo_jm.png"
                    alt="Jeremias Marturano"
                    className="h-20 w-auto object-contain"
                />
            </div>
        </a>
    );
};

export default Signature;
