import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // 1. Fungsi ini murni cuma buat nge-fetch data dari Supabase, tanpa nyentuh state
const getPostsFromDB = async () => {
    // Tambahkan .order() setelah .select()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false }) // false artinya paling baru di atas

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

// Tambahin state baru buat file
const [file, setFile] = useState(null)

async function handleSubmit(e) {
  e.preventDefault()
  let publicUrl = ""

  // 1. Proses Upload Gambar ke Storage
  if (file) {
    const fileName = `${Date.now()}_${file.name}`
    const { data, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, file)

    if (uploadError) {
      alert("Gagal upload gambar: " + uploadError.message)
      return
    }

    // 2. Ambil Link Public Gambarnya
    const { data: publicData } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName)
    
    publicUrl = publicData.publicUrl
  }

  // 3. Simpan data ke Table (Teks + URL Gambar)
  const { error } = await supabase.from('posts').insert([
    { title, body, image_url: publicUrl }
  ])

  if (!error) {
    setTitle(''); setBody(''); setFile(null)
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
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
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
          {post.image_url && <img src={post.image_url} alt="project" style={{width: '200px'}} />}
          <h4>{post.title}</h4>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  )
}

export default App