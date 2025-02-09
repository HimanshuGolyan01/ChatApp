import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Navbar({ searchResult, setSearchResult }) {

  const navigate = useNavigate();
  const myProfile = localStorage.getItem("userName")

  const [search, setSearch] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const searchHandler = (e) => {
    e.preventDefault();
    if (search.trim() === '') {
      setSearchResult([]);
      return;
    }
    axios.get(`http://localhost:3000/alluser?search=${search}`, {
      headers: {
        "Authorization": localStorage.getItem("jwt"),
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setSearchResult(response.data);
    });
  };

  const options = [
    { value: 'profile', label: myProfile },
    { value: 'logout', label: 'Logout' }
  ];

  const handleDropdownSelect = (option) => {
    if (option.value === 'profile') {
      console.log('Navigate to profile');
    } else if (option.value === 'logout') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userId');
      localStorage.removeItem("userName")
      navigate("/login")
    }
  };

  return (
    <div className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <input
          className="bg-gray-700 text-white border-2 border-gray-600 rounded-2xl px-3 py-2 w-[19rem] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="text"
          placeholder="Search User ..."
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value.trim() === '') {
              setSearchResult([]);
            }
          }}
        />
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 focus:outline-none"
          onClick={searchHandler}
        >
          Search
        </button>
      </div>
      <div className="font-bold text-2xl text-white">
        LOOPCHAT
      </div>
      <div className="relative">
        <img
          src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
          className="h-[35px] w-[35px] rounded-2xl cursor-pointer"
          onClick={() => setDropdownVisible(!dropdownVisible)}
        />
        {dropdownVisible && (
          <div className="absolute right-0 mt-2 w-[150px] bg-gray-700 text-white border border-gray-600 rounded-md shadow-lg z-10">
            {options?.map(option => (
              <div
                key={option.value}
                className="p-2 cursor-pointer hover:bg-gray-600"
                onClick={() => {
                  handleDropdownSelect(option);
                  setDropdownVisible(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
