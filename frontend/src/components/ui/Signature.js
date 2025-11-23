import React from 'react';

const Signature = () => {
    return (
        <a
            href="https://www.linkedin.com/in/jeremiasmarturano/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] transition-transform hover:scale-110"
        >
            <img
                src="/logo_jm.png"
                alt="Jeremias Marturano"
                className="h-32 w-auto object-contain drop-shadow-xl"
            />
        </a>
    );
};

export default Signature;
