import React, { useState, useEffect } from "react";
import blogService from "./services/blogs";
import authService from "./services/auth";
import BlogsList from "./components/BlogsList";
import LoginForm from "./components/LoginForm";
import Heading from "./components/Heading";
import UserDetails from "./components/UserDetails";
import AddBlogForm from "./components/AddBlogForm";
import "./App.css";
import Message from "./components/Message";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogInSubmit = async credentials => {
    try {
      const user = await authService.login(credentials);

      window.localStorage.setItem("loggedBlogUser", JSON.stringify(user));
      console.log(user);
      console.log("here");
      blogService.setToken(user.token);
      setUser(user);
    } catch (err) {
      console.log(err, err.message);
      console.log("not");
      console.log(err.response);
      setErrorMessage(err.response.data.error);
    }

    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  const handleLogOut = () => {
    setUser(null);
    window.localStorage.removeItem("loggedBlogUser");
  };

  const handleBlogAdded = async newBlog => {
    try {
      const blog = await blogService.addBlog(newBlog);
      setBlogs([...blogs, blog]);
      setSuccessMessage(`a new blog ${blog.title} by ${blog.author}`);
      console.log(blog);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.log(err.response);
      setErrorMessage(err.response.data.error);
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleLikeClick = async newBlog => {
    console.log(newBlog);
    const updatedBlog = await blogService.updateBlog(newBlog);
    const newBlogs = blogs.map(blog => {
      return blog.id === updatedBlog.id ? updatedBlog : blog;
    });
    setBlogs(newBlogs);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const blogsResult = await blogService.getAll();
        console.log(blogsResult);
        setBlogs(blogsResult);
      } catch (err) {
        console.log(err);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const localUser = window.localStorage.getItem("loggedBlogUser");
    if (localUser) {
      const user = JSON.parse(localUser);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  return (
    <div className="App">
      {user ? (
        <Heading text="blogs" />
      ) : (
        <Heading text="log in to application" />
      )}
      {user ? (
        <>
          {errorMessage && <Message text={errorMessage} isError />}
          {successMessage && <Message text={successMessage} />}
          <UserDetails user={user} onLogOut={handleLogOut} />
          <AddBlogForm onBlogAdded={handleBlogAdded} />
          <BlogsList blogs={blogs} onLikeClick={handleLikeClick} />
        </>
      ) : (
        <>
          {errorMessage && <Message text={errorMessage} isError />}
          <LoginForm onSubmit={handleLogInSubmit} />
        </>
      )}
    </div>
  );
};

export default App;
