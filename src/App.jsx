import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // 1. Fungsi ini murni cuma buat nge-fetch data dari Supabase, tanpa nyentuh state
  const getPostsFromDB = async () => {
    const { data, error } = await supabase.from('posts').select('*')
    if (error) {
      console.error('Error fetching:', error)
      return null
    }
    return data
  }

  // 2. useEffect panggil fetcher-nya, baru nge-set state pakai .then()
  useEffect(() => {
    getPostsFromDB().then((data) => {
      if (data) setPosts(data)
    })
  }, [])

  // 3. Fungsi buat handle form submit
  async function handleSubmit(e) {
    e.preventDefault()
    
    // Insert data ke Supabase
    const { error } = await supabase.from('posts').insert([{ title, body }])
    
    if (error) {
      alert('Gagal input: ' + error.message)
    } else {
      // Kosongin form
      setTitle('')
      setBody('')
      
      // Ambil data terbaru dari DB, lalu update state lagi
      const newData = await getPostsFromDB()
      if (newData) setPosts(newData)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Database</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Judul" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <br /><br />
        <textarea 
          placeholder="Isi Body" 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
        />
        <br />
        <button type="submit">Kirim ke Database</button>
      </form>

      <hr />
      <h3>Daftar Post:</h3>
      {posts && posts.map(post => (
        <div key={post.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
          <h4>{post.title}</h4>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  )
}

export default App