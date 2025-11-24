import React from 'react';

const Signature = () => {
    return (
        <a
            href="https://www.linkedin.com/in/jeremiasmarturano/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[100] transition-all hover:scale-110 hover:opacity-100 opacity-70"
        >
            <img
                src="/logo_jm_new.png"
                alt="Jeremias Marturano"
                className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
            />
        </a>
    );
};

export default Signature;
