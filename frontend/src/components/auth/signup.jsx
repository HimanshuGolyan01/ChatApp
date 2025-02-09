import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/signup', {
            name,
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.data.msg === 'new user added successfully') {
                response.data.msg ? toast.success(response.data.msg) : "";
                navigate('/login');
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
            toast.error(error.response.data.error);
        });
    };

    return(
        <>
            <form onSubmit={onSubmitHandler} className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="h-auto w-[30rem] bg-gray-800 rounded-lg p-6 shadow-lg text-white">
                    <div className="font-extrabold text-center text-[2rem] mb-6">Sign Up</div>
                    <div className="flex flex-col mb-4">
                        <label className="pl-1 font-semibold" htmlFor="name">Name</label>
                        <input className="border-2 bg-gray-700 text-white rounded-md border-gray-600 pl-2 py-2" type="text" placeholder="Enter your name..." onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="pl-1 font-semibold" htmlFor="email">Email</label>
                        <input className="border-2 bg-gray-700 text-white rounded-md border-gray-600 pl-2 py-2" type="email" placeholder="Enter your email..." onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="pl-1 font-semibold" htmlFor="password">Password</label>
                        <input className="border-2 bg-gray-700 text-white rounded-md border-gray-600 pl-2 py-2" type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="text-center text-blue-400 underline mb-4">
                        <a href="/login">Already have an account?</a>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 w-full rounded-md p-3 text-white font-bold text-[1rem]">Sign Up</button>
                </div>
            </form>
        </>
    );
}

export default SignUp;
