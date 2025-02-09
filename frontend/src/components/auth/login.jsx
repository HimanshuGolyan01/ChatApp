import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.post("http://localhost:3000/login", {
            email, password
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.data.msg === 'user login successfully') {
                localStorage.setItem('jwt', response.data.token);
                localStorage.setItem('userId', response.data.uid);
                localStorage.setItem("userName", response.data.name);
                response.data.msg && toast.success(response.data.msg);
                navigate('/mainscreen');
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
            toast.error(error.response?.data?.error || 'Login failed');
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <form onSubmit={onSubmitHandler} className="w-[30rem] p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-extrabold text-center">Log In</h2>
                <div className="mt-6">
                    <label className="block font-semibold">Email</label>
                    <input className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Enter your email..." onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mt-6">
                    <label className="block font-semibold">Password</label>
                    <input className="w-full p-2 mt-1 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mt-6 text-center">
                    <a href="/" className="text-blue-400 hover:underline">Create an Account!</a>
                </div>
                <button className="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold text-white">Log In</button>
            </form>
        </div>
    );
};

export default Login;
