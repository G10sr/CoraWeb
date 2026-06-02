import "../App.css";

function App() {
  const posts = Array(6).fill(null);

  return (
    <div className="profile-page">

      {/* Header */}
      <header className="banner">
        <button className="back-btn">&lt;</button>

        <div className="profile-picture">
          <img
            src="https://placehold.co/150x150"
            alt="Profile"
          />
        </div>
      </header>

      {/* Profile Info */}
      <section className="profile-info">

        <div className="stats-container">
          <div className="stat verified">
            <h2>10</h2>
            <p>Verified</p>
          </div>

          <div className="stat connections">
            <h2>10</h2>
            <p>Connections</p>
          </div>
        </div>

        <h1>Alan Brito</h1>

        <section className="about-section">
          <h2>About Me</h2>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>

          <button>Edit About Me</button>
        </section>

        <section className="posts-section">
          <h2>Posts</h2>

          <div className="posts-grid">
            {posts.map((_, index) => (
              <div key={index} className="post-card">

                <div className="post-actions">
                  <button>✓</button>
                  <button>✎</button>
                  <button>🗑</button>
                </div>

              </div>
            ))}
          </div>

        </section>

      </section>

    </div>
  );
}

export default App;