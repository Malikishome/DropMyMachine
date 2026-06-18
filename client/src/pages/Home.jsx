import React from 'react';

import { Link } from 'react-router-dom';

// TO-DO: make it look nice with tailwindcss
function Home() {

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-4xl text-center font-bold mb-4">DropMy<span className="text-blue-500 inline-block  origin-top-left animate-hang">Machine</span></h2>
        <p className="text-lg text-center mt-2">The fastest way to connect machine owners with high-traffic locations.</p>
        <Link to="/login"><button className="bg-blue-500 text-white px-4 py-2 rounded-xl cursor-pointer mt-4 hover:bg-blue-600">Login</button>
        </Link>
        <Link to="/register"><button className="bg-blue-500 text-white px-4 py-2 rounded-xl cursor-pointer mt-4 hover:bg-blue-600">Get Started</button>
        </Link>
        </div>
    );
  }
  
  export default Home;
