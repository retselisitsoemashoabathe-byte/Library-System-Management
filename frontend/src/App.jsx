import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  Bell,
  Search,
  Plus,
  ChevronRight,
  Library,
  BookCheck,
  BookMarked,
  AlertTriangle,
  MoreHorizontal,
  Settings,
  X,
  Pencil,
  Trash2
} from 'lucide-react'

import './App.css'

function App() {
    const navigate = useNavigate()
  const location = useLocation()

  const pageNames = {
    '/': 'Dashboard',
    '/books': 'Books',
    '/transactions': 'Transactions',
    '/users': 'Users'
  }

  const activePage = pageNames[location.pathname] || 'Dashboard'

  function setActivePage(page) {
    const paths = {
      Dashboard: '/',
      Books: '/books',
      Transactions: '/transactions',
      Users: '/users'
    }

    navigate(paths[page])
  }
  // BOOK DATA
 // BOOK DATA
const [books, setBooks] = useState([])

useEffect(() => {
  fetch('http://localhost:5000/api/books')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      return response.json()
    })
    .then(data => setBooks(data))
    .catch(error => console.error('Error loading books:', error))
}, [])
  // BOOK FORM DATA
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: ''
  })

  // TRANSACTION DATA
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
  async function fetchTransactions() {
    try {
      const response = await fetch('http://localhost:5000/api/transactions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load transactions.');
      }

      setTransactions(data.map(transaction => ({
        id: transaction.id,
        bookId: transaction.book_id,
        bookTitle: transaction.book_title,
        type: transaction.type,
        quantity: Number(transaction.quantity),
        userName: transaction.user_name,
        date: new Date(transaction.transaction_date).toLocaleString()
      })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  fetchTransactions();
}, []);

  // USER DATA
  const [users, setUsers] = useState([
    { id: 1, name: 'Administrator', membershipId: 'ADMIN001', role: 'Admin' },
    { id: 2, name: 'Test User', membershipId: 'MEM001', role: 'Member' }
  ])
  useEffect(() => {
  fetch('http://localhost:5000/api/users')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      return response.json();
    })
    .then(data => {
      setUsers(data.map(user => ({
        id: user.id,
        name: user.name,
        membershipId: user.membership_id,
        role: user.role
      })));
    })
    .catch(error => console.error('Error loading users:', error));
}, []);
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    membershipId: '',
    role: 'Member'
  })
  const [loginData, setLoginData] = useState({
    membershipId: '',
    name: ''
  })
  const [loggedInUser, setLoggedInUser] = useState(null)

  const [transactionData, setTransactionData] = useState({
    bookId: '',
    type: 'Borrow',
    quantity: 1,
    userName: ''
  })

  // NAVIGATION
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Books', icon: BookOpen },
    { name: 'Transactions', icon: ArrowLeftRight },
    { name: 'Users', icon: Users }
  ]

  // DASHBOARD STATISTICS
  const totalCopies = books.reduce(
    (total, book) => total + book.quantity,
    0
  )

  const borrowedCopies = transactions
    .filter(transaction => transaction.type === 'Borrow')
    .reduce((total, transaction) => total + transaction.quantity, 0)

  const returnedCopies = transactions
    .filter(transaction => transaction.type === 'Return')
    .reduce((total, transaction) => total + transaction.quantity, 0)

  const stats = [
    {
      title: 'Total Books',
      value: books.length,
      note: 'Registered titles',
      icon: Library
    },
    {
      title: 'Available Books',
      value: totalCopies,
      note: 'Copies in stock',
      icon: BookCheck
    },
    {
      title: 'Borrowed Books',
      value: Math.max(0, borrowedCopies - returnedCopies),
      note: 'Currently borrowed',
      icon: BookMarked
    },
    {
      title: 'Low Stock',
      value: books.filter(book => book.quantity < 2).length,
      note: 'Require attention',
      icon: AlertTriangle
    }
  ]

  // SEARCH BOOKS
  const filteredBooks = books.filter(book =>
    `${book.title} ${book.author} ${book.genre} ${book.isbn}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // OPEN ADD BOOK FORM
  function openAddForm() {
    setEditingBook(null)

    setFormData({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      quantity: ''
    })

    setShowForm(true)
  }

  // OPEN EDIT BOOK FORM
  function openEditForm(book) {
    setEditingBook(book)

    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: String(book.quantity)
    })

    setShowForm(true)
  }

  // HANDLE BOOK INPUTS
  const handleInputChange = (event) => {
  const { name, value } = event.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};
 const handleSubmit = async (event) => {
  event.preventDefault();

  const bookData = {
    title: formData.title.trim(),
    author: formData.author.trim(),
    genre: formData.genre.trim(),
    isbn: formData.isbn.trim(),
    quantity: Number(formData.quantity)
  };

  if (
    !bookData.title ||
    !bookData.author ||
    !bookData.genre ||
    !bookData.isbn ||
    bookData.quantity < 0
  ) {
    alert('Please enter valid book details.');
    return;
  }

  try {
    const url = editingBook
      ? `http://localhost:5000/api/books/${editingBook.id}`
      : 'http://localhost:5000/api/books';

    const response = await fetch(url, {
      method: editingBook ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || errorData.message || 'Failed to save book.');
}

    const savedBook = await response.json();

    if (editingBook) {
      setBooks(prev =>
        prev.map(book =>
          book.id === editingBook.id
            ? { ...bookData, id: editingBook.id }
            : book
        )
      );
    } else {
      setBooks(prev => [{ ...bookData, id: savedBook.id }, ...prev]);
    }

    setShowForm(false);
    setEditingBook(null);
    alert('Book saved successfully!');
  } catch (error) {
    alert(error.message);
  }
};

  // DELETE BOOK
async function deleteBook(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this book?'
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/books/${id}`,
      {
        method: 'DELETE'
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete book.');
    }

    setBooks(previous =>
      previous.filter(book => book.id !== id)
    );

    alert(result.message || 'Book deleted successfully.');
  } catch (error) {
    alert(error.message);
  }
}

  // HANDLE TRANSACTION INPUTS
  function handleTransactionChange(event) {
    const { name, value } = event.target

    setTransactionData(previous => ({
      ...previous,
      [name]: value
    }))
  }

  // RECORD TRANSACTION
 async function handleTransactionSubmit(event) {
  event.preventDefault();

  const selectedBook = books.find(
    book => book.id === Number(transactionData.bookId)
  );

  const quantity = Number(transactionData.quantity);
  const userName = transactionData.userName.trim();
  const type = transactionData.type;

  if (!selectedBook) {
    alert('Please select a book.');
    return;
  }

  if (!userName) {
    alert('Please enter a name.');
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert('Please enter a valid quantity.');
    return;
  }

  const selectedUser = users.find(
    user => user.name.toLowerCase() === userName.toLowerCase()
  );

  if (!selectedUser) {
    alert('This person is not registered. Please register them first.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: selectedBook.id,
        user_id: selectedUser.id,
        type,
        quantity
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Transaction failed.');
    }

    setBooks(previous =>
      previous.map(book =>
        book.id === selectedBook.id
          ? { ...book, quantity: result.newStock }
          : book
      )
    );

    setTransactions(previous => [
      {
        id: result.id,
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        type,
        quantity,
        userName,
        date: new Date().toLocaleString()
      },
      ...previous
    ]);

    setTransactionData({
      bookId: '',
      type: 'Borrow',
      quantity: 1,
      userName: ''
    });

    alert(result.message);
  } catch (error) {
    alert(error.message);
  }
}
  
async function deleteUser(id) {
  const userToDelete = users.find(user => user.id === id);

  if (userToDelete?.role === 'Admin') {
    alert('Admin accounts cannot be deleted from this page.');
    return;
  }

  if (loggedInUser?.id === id) {
    alert('Log out this user before deleting the account.');
    return;
  }

  if (!window.confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/users/${id}`,
      { method: 'DELETE' }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete user.');
    }

    setUsers(previous => previous.filter(user => user.id !== id));

    alert(result.message || 'User deleted successfully.');
  } catch (error) {
    alert(error.message);
  }
}

  function handleLoginChange(event) {
    const { name, value } = event.target
    setLoginData(previous => ({ ...previous, [name]: value }))
  }

  function handleLoginSubmit(event) {
    event.preventDefault()

    const matchedUser = users.find(user =>
      user.membershipId.toLowerCase() === loginData.membershipId.trim().toLowerCase() &&
      user.name.toLowerCase() === loginData.name.trim().toLowerCase()
    )

    if (!matchedUser) {
      alert('User not found. Check the name and membership ID.')
      return
    }

    setLoggedInUser(matchedUser)
    setLoginData({ membershipId: '', name: '' })
    alert(`Welcome, ${matchedUser.name}.`)
  }
function handleUserInputChange(event) {
  const { name, value } = event.target;

  setUserFormData(previous => ({
    ...previous,
    [name]: value
  }));
}

function openEditUserForm(user) {
  setEditingUser(user);

  setUserFormData({
    name: user.name,
    membershipId: user.membershipId,
    role: user.role
  });

  setShowUserForm(true);
}
  function openAddUserForm() {
  setEditingUser(null);
  setUserFormData({
    name: '',
    membershipId: '',
    role: 'Member'
  });
  setShowUserForm(true);
}
async function handleUserSubmit(event) {
  event.preventDefault();

  const name = userFormData.name.trim();
  const membershipId = userFormData.membershipId.trim();

  if (!name || !membershipId || !userFormData.role) {
    alert('Please complete all user fields.');
    return;
  }

  try {
    const userData = {
      name,
      membership_id: membershipId,
      role: userFormData.role
    };

    const url = editingUser
      ? `http://localhost:5000/api/users/${editingUser.id}`
      : 'http://localhost:5000/api/users';

    const response = await fetch(url, {
      method: editingUser ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save user.');
    }

    if (editingUser) {
      setUsers(previous =>
        previous.map(user =>
          user.id === editingUser.id
            ? { ...user, name, membershipId, role: userFormData.role }
            : user
        )
      );
    } else {
      setUsers(previous => [
        { id: result.id, name, membershipId, role: userFormData.role },
        ...previous
      ]);
    }

    setShowUserForm(false);
    setEditingUser(null);
    setUserFormData({
      name: '',
      membershipId: '',
      role: 'Member'
    });

    alert(result.message || 'User saved successfully!');
  } catch (error) {
    alert(error.message);
  }
}
  return (
    <div className="app-container">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <h2>LIBRARY.</h2>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">WORKSPACE</p>

          {menuItems.map(item => {
            const Icon = item.icon

            return (
              <button
                key={item.name}
                className={`menu-item ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} strokeWidth={1.8} />

                <span>{item.name}</span>

                {activePage === item.name && (
                  <ChevronRight size={16} />
                )}
              </button>
            )
          })}
        </div>

        <div className="sidebar-bottom">
          <button className="menu-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <h4>Administrator</h4>
              <span>Library Admin</span>
            </div>

            <MoreHorizontal size={20} />
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">
          <div>
            <p className="breadcrumb">
              WORKSPACE / {activePage.toUpperCase()}
            </p>

            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <div className="search-button">
              <Search size={19} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </div>

            <button className="notification-button">
              <Bell size={19} />
              <span></span>
            </button>
          </div>
        </header>

        {/* DASHBOARD PAGE */}

        {activePage === 'Dashboard' && (
          <div className="page-content">

            <section className="welcome-banner">
              <div>
                <span className="welcome-tag">
                  LIBRARY OVERVIEW
                </span>

                <h2>Welcome back, Administrator.</h2>

                <p>
                  Here's an overview of your library's activity and performance.
                </p>
              </div>

              <div className="banner-decoration">
                <BookOpen size={105} strokeWidth={0.8} />
              </div>
            </section>

            <div className="stats-grid">
              {stats.map(stat => {
                const Icon = stat.icon

                return (
                  <div className="stat-card" key={stat.title}>
                    <div className="stat-top">
                      <span>{stat.title}</span>

                      <div className="stat-icon">
                        <Icon size={20} />
                      </div>
                    </div>

                    <h2>{stat.value}</h2>
                    <p>{stat.note}</p>
                  </div>
                )
              })}
            </div>

            <div className="section-heading">
              <div>
                <h2>Library Inventory</h2>
                <p>
                  Monitor your registered books and their availability.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => setActivePage('Books')}
              >
                <Plus size={17} />
                Manage Books
              </button>
            </div>

            <section className="inventory-card">
              <div className="inventory-header">
                <div>
                  <h3>Recently Added Books</h3>
                  <p>Overview of your current book collection</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => setActivePage('Books')}
                >
                  View inventory <ChevronRight size={16} />
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>BOOK TITLE</th>
                      <th>AUTHOR</th>
                      <th>GENRE</th>
                      <th>QUANTITY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {books.slice(-5).reverse().map(book => (
                      <tr key={book.id}>
                        <td className="book-title">
                          <div className="book-cover">
                            <BookOpen size={18} />
                          </div>

                          {book.title}
                        </td>

                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>{book.quantity}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              book.quantity < 2 ? 'low' : 'available'
                            }`}
                          >
                            <span></span>

                            {book.quantity < 2
                              ? 'Low stock'
                              : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* BOOK MANAGEMENT PAGE */}

        {activePage === 'Books' && (
          <div className="page-content">

            <section className="welcome-banner">
              <div>
                <span className="welcome-tag">
                  COLLECTION MANAGEMENT
                </span>

                <h2>Manage Your Books.</h2>

                <p>
                  Add, update and monitor your library collection.
                </p>
              </div>
            </section>

            <div className="book-page-heading">
              <div>
                <h2>Book Inventory</h2>
                <p>
                  Manage all books registered in your library.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={openAddForm}
              >
                <Plus size={17} />
                Add New Book
              </button>
            </div>

            <section className="inventory-card">

              <div className="inventory-header">
                <div>
                  <h3>All Books</h3>
                  <p>Your complete library collection</p>
                </div>

                <span className="book-count">
                  {books.length} Books
                </span>
              </div>

              <div className="book-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by title, author, genre or ISBN..."
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>BOOK TITLE</th>
                      <th>AUTHOR</th>
                      <th>GENRE</th>
                      <th>ISBN</th>
                      <th>QUANTITY</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.id}>
                        <td className="book-title">
                          <div className="book-cover">
                            <BookOpen size={18} />
                          </div>

                          {book.title}
                        </td>

                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>{book.isbn}</td>
                        <td>{book.quantity}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              book.quantity < 2 ? 'low' : 'available'
                            }`}
                          >
                            <span></span>

                            {book.quantity < 2
                              ? 'Low stock'
                              : 'Available'}
                          </span>
                        </td>

                        <td>
                          <button
                            className="action-button"
                            onClick={() => openEditForm(book)}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            className="action-button delete"
                            onClick={() => deleteBook(book.id)}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-message">
                          No books found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </section>

          </div>
        )}

        {/* TRANSACTIONS PAGE */}

        {activePage === 'Transactions' && (
          <div className="page-content">

            <section className="welcome-banner">
              <div>
                <span className="welcome-tag">
                  STOCK & BORROWING MANAGEMENT
                </span>

                <h2>Library Transactions.</h2>

                <p>
                  Record borrowed books, returns and new stock arrivals.
                </p>
              </div>
            </section>

            <div className="book-page-heading">
              <div>
                <h2>Record Transaction</h2>
                <p>Enter the details of the book transaction.</p>
              </div>
            </div>

            <section className="inventory-card transaction-form-card">

              <form onSubmit={handleTransactionSubmit}>

                <div className="form-group">
                  <label>Select Book</label>

                  <select
                    name="bookId"
                    value={transactionData.bookId}
                    onChange={handleTransactionChange}
                  >
                    <option value="">Choose a book</option>

                    {books.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.quantity} available
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction Type</label>

                  <select
                    name="type"
                    value={transactionData.type}
                    onChange={handleTransactionChange}
                  >
                    <option value="Borrow">Borrow Book</option>
                    <option value="Return">Return Book</option>
                    <option value="Add Stock">Add New Stock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    step="1"
                    value={transactionData.quantity}
                    onChange={handleTransactionChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    {transactionData.type === 'Add Stock'
                      ? 'Recorded By'
                      : 'User Name'}
                  </label>

                  <input
                    type="text"
                    name="userName"
                    placeholder="Enter name"
                    value={transactionData.userName}
                    onChange={handleTransactionChange}
                  />
                </div>

                <button type="submit" className="primary-button">
                  <Plus size={17} />
                  Record Transaction
                </button>

              </form>

            </section>

            <div className="book-page-heading">
              <div>
                <h2>Transaction History</h2>
                <p>View all recorded library transactions.</p>
              </div>

              <span className="book-count">
                {transactions.length} Transactions
              </span>
            </div>

            <section className="inventory-card">

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>BOOK TITLE</th>
                      <th>TRANSACTION</th>
                      <th>QUANTITY</th>
                      <th>USER</th>
                      <th>DATE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td className="book-title">
                          {transaction.bookTitle}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              transaction.type === 'Borrow'
                                ? 'low'
                                : 'available'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        <td>{transaction.quantity}</td>
                        <td>{transaction.userName}</td>
                        <td>{transaction.date}</td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </section>

          </div>
        )}

        {/* USER MANAGEMENT PAGE */}

        {activePage === 'Users' && (
          <div className="page-content">
            

            <section className="welcome-banner">
              <div>
                <span className="welcome-tag">
                  LIBRARY MANAGEMENT
                </span>

                <h2>Manage Library Users.</h2>

                <p>Register members, manage account roles and access the library system.</p>
              </div>
            </section>

            <div className="user-management-grid">
              <section className="inventory-card user-login-card">
                <div className="inventory-header">
                  <div>
                    <h3>User Login</h3>
                    <p>Sign in using a registered name and membership ID.</p>
                  </div>
                  {loggedInUser && (
                    <span className="status-badge available">Logged in</span>
                  )}
                </div>

                {loggedInUser ? (
                  <div className="logged-in-panel">
                    <div>
                      <span className="user-avatar">
                        {loggedInUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4>{loggedInUser.name}</h4>
                      <p>{loggedInUser.membershipId} · {loggedInUser.role}</p>
                    </div>
                    <button
                      className="cancel-button"
                      type="button"
                      onClick={() => setLoggedInUser(null)}
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <form className="user-login-form" onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter registered name"
                        value={loginData.name}
                        onChange={handleLoginChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Membership ID</label>
                      <input
                        type="text"
                        name="membershipId"
                        placeholder="Enter membership ID"
                        value={loginData.membershipId}
                        onChange={handleLoginChange}
                      />
                    </div>

                    <button type="submit" className="primary-button">
                      Log In
                    </button>
                  </form>
                )}
              </section>

              <section className="inventory-card user-summary-card">
                <span className="welcome-tag">REGISTERED USERS</span>
                <h2>{users.length}</h2>
                <p>Total registered library accounts</p>
                <div className="user-summary-details">
                  <span>Admins: {users.filter(user => user.role === 'Admin').length}</span>
                  <span>Members: {users.filter(user => user.role === 'Member').length}</span>
                </div>
              </section>
            </div>

            <div className="book-page-heading">
              <div>
                <h2>User Directory</h2>
                <p>View, add, update and remove library user accounts.</p>
              </div>

              

              <button className="primary-button" onClick={openAddUserForm}>
                <Plus size={17} />
                Add New User
              </button>
            </div>

            <section className="inventory-card">
              <div className="inventory-header">
                <div>
                  <h3>Registered Users</h3>
                  <p>Library members and administrators</p>
                </div>
                <span className="book-count">{users.length} Users</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>MEMBERSHIP ID</th>
                      <th>ROLE</th>
                      <th>ACCOUNT STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="book-title">
                          <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </td>
                        <td>{user.membershipId}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className="status-badge available">
                            <span></span>
                            Registered
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-button"
                            onClick={() => openEditUserForm(user)}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            className="action-button delete"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No users registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* ADD / EDIT USER MODAL */}

      {showUserForm && (
        <div className="modal-overlay">
          <div className="book-modal">
            <div className="modal-header">
              <div>
                <span className="welcome-tag">USER MANAGEMENT</span>
                <h2>{editingUser ? 'Edit User' : 'Register New User'}</h2>
                <p>Enter the user's account information below.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowUserForm(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={userFormData.name}
                  onChange={handleUserInputChange}
                />
              </div>

              <div className="form-group">
                <label>Membership ID</label>
                <input
                  type="text"
                  name="membershipId"
                  placeholder="e.g. MEM002"
                  value={userFormData.membershipId}
                  onChange={handleUserInputChange}
                />
              </div>

              <div className="form-group">
                <label>User Role</label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserInputChange}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowUserForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingUser ? 'Save Changes' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}

      {showForm && (
        <div className="modal-overlay">

          <div className="book-modal">

            <div className="modal-header">
              <div>
                <span className="welcome-tag">
                  BOOK MANAGEMENT
                </span>

                <h2>
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>

                <p>Enter the book information below.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Book Title</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Author</label>

                <input
                  type="text"
                  name="author"
                  placeholder="Enter author's name"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Genre</label>

                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                >
                  <option value="">Select a genre</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Personal Development">
                    Personal Development
                  </option>
                  <option value="Beauty & Design">
                    Beauty & Design
                  </option>
                  <option value="Fiction">Fiction</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>ISBN</label>

                <input
                  type="text"
                  name="isbn"
                  placeholder="Enter ISBN number"
                  value={formData.isbn}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Initial Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="1"
                  placeholder="Enter number of copies"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default App