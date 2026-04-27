import React from 'react';
import { Link } from 'react-router-dom';

// TO-DO: make it look nice with tailwindcss
function Home() {

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl text-center font-bold">Welcome to DropMyMachine</h1>
        <p>The fastest way to connect machine owners with high-traffic locations.</p>
        <Link to="/login"><button className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600">Login</button>
        </Link>
        <Link to="/register"><button className='bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600'>Register</button>
        </Link>
        </div>
    );
  }
  
  export default Home;
