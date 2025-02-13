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
                navigate('/signup');
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
            toast.error(error.response?.data?.error || 'Login failed');
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-gray-900">
            <form onSubmit={onSubmitHandler} className="w-[30rem] p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900">Welcome Back</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Email</label>
                    <input className="w-full p-3 mt-2 bg-gray-200 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" type="email" placeholder="Enter your email..." onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold">Password</label>
                    <input className="w-full p-3 mt-2 bg-gray-200 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex justify-between items-center text-sm">
                    <a href="/forgot-password" className="text-indigo-500 hover:underline">Forgot Password?</a>
                    <a href="/signup" className="text-indigo-500 hover:underline">Create an Account!</a>
                </div>
                <button className="w-full mt-6 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-bold text-white transition duration-300 ease-in-out transform hover:scale-105">Log In</button>
            </form>
            <p className="mt-6 text-gray-600 text-sm">Chat. Connect. Repeat.</p>
        </div>
    );
};

export default Login;
