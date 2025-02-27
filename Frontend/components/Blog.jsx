import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate, useParams } from 'react-router-dom';

// BlogList Component
const BlogList = () => {
  // State for blogs and form
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({ id: null, title: '', content: '', date: '' });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 6,
    hasNext: false,
    hasPrev: false
  });

  // API base URL
  const API_URL = 'http://localhost:5000/api/blogs';
  const navigate = useNavigate();

  // Fetch blogs from the Flask API with pagination
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?page=${page}&per_page=${pagination.perPage}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setBlogs(data.blogs);
      setPagination({
        currentPage: data.current_page,
        totalPages: data.pages,
        totalItems: data.total,
        perPage: data.per_page,
        hasNext: data.has_next,
        hasPrev: data.has_prev
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch blogs. ' + err.message);
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Add a new blog
  const addBlog = async (blogData) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newBlog = await response.json();
      // Refetch the first page to show the new blog
      fetchBlogs(1);
      setError(null);
    } catch (err) {
      setError('Failed to add blog. ' + err.message);
      console.error('Error adding blog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing blog
  const updateBlog = async (id, blogData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedBlog = await response.json();
      setBlogs(blogs.map(blog => blog.id === id ? updatedBlog : blog));
      setError(null);
    } catch (err) {
      setError('Failed to update blog. ' + err.message);
      console.error('Error updating blog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a blog
  const deleteBlog = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Refetch current page after deletion
      fetchBlogs(pagination.currentPage);
      setError(null);
    } catch (err) {
      setError('Failed to delete blog. ' + err.message);
      console.error('Error deleting blog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentBlog.title.trim() === '' || currentBlog.content.trim() === '') {
      alert('Please fill in all fields');
      return;
    }
    
    const blogData = {
      title: currentBlog.title,
      content: currentBlog.content,
    };
    
    if (editMode) {
      updateBlog(currentBlog.id, blogData);
    } else {
      addBlog(blogData);
    }
    
    resetForm();
  };

  // Edit a blog
  const handleEdit = (blog) => {
    setCurrentBlog({ ...blog });
    setEditMode(true);
    setShowForm(true);
  };

  // Delete a blog
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlog(id);
    }
  };

  // Reset the form
  const resetForm = () => {
    setCurrentBlog({ id: null, title: '', content: '', date: '' });
    setShowForm(false);
    setEditMode(false);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchBlogs(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">SIMPLE BLOG POSTS</h1>
           
            <button 
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setCurrentBlog({ id: null, title: '', content: '', date: '' });
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loading}
            >
              New Post
            </button>
          </div>
          <div
          className='py-2'></div>
          <h4 className="text-sm font-bold text-gray-700">Post your blogs and share your insights.</h4>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Blog Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
                <input 
                  type="text" 
                  id="title" 
                  value={currentBlog.title}
                  onChange={(e) => setCurrentBlog({...currentBlog, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter blog title"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 font-bold mb-2">Content</label>
                <textarea 
                  id="content" 
                  value={currentBlog.content}
                  onChange={(e) => setCurrentBlog({...currentBlog, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 h-32"
                  placeholder="Write your blog content here..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition duration-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editMode ? 'Update' : 'Publish')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && !showForm && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Blog List */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div 
                  className="p-6"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{blog.title}</h3>
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleEdit(blog)}
                        className="text-blue-500 hover:text-blue-700"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{blog.date}</p>
                  <p className="text-gray-700">{blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}</p>
                  <button className="mt-4 text-blue-600 hover:underline">Read More</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && blogs.length > 0 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`mx-1 px-3 py-1 rounded ${pagination.hasPrev ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Prev
              </button>
              
              {[...Array(pagination.totalPages).keys()].map(page => (
                <button
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.currentPage === page + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`mx-1 px-3 py-1 rounded ${pagination.hasNext ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!loading && blogs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No blog posts yet</h3>
            <p className="text-gray-500 mb-6">Click the "New Post" button to create your first blog post.</p>
            <button 
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
            >
              Create First Post
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Single Blog Post Component
const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api/blogs';

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setBlog(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch blog. ' + err.message);
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Blog post not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">My Blog</h1>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-2">{blog.title}</h2>
          <p className="text-gray-500 mb-6">{blog.date}</p>
          <div className="prose max-w-none">
            {blog.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
};

// Main App Component
const BlogApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
      </Routes>
    </Router>
  );
};

export default BlogApp;