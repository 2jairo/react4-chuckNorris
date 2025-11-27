import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import FactCard from '../../components/factCard/factCard'
import { RefreshIcon, SearchIcon } from '../../components/icons/icons'
import './home.css'

const Home = () => {
    const api = useApi()
    
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [randomFact, setRandomFact] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState(null)
    
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [loadingRandomFact, setLoadingRandomFact] = useState(false)
    const [loadingSearch, setLoadingSearch] = useState(false)
    
    const [error, setError] = useState(null)

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories()
        fetchRandomFact()
    }, [])

    const fetchCategories = async () => {
        setLoadingCategories(true)
        setError(null)
        try {
            const response = await api.chuckNorris.getCategories()
            setCategories(response.data)
        } catch (err) {
            setError('Error al cargar categorias')
            console.error(err)
        } finally {
            setLoadingCategories(false)
        }
    }

    const fetchRandomFact = async (category = null) => {
        setLoadingRandomFact(true)
        setError(null)
        try {
            const response = await api.chuckNorris.getRandomFact({ 
                category: category || selectedCategory 
            })
            setRandomFact(response.data)
        } catch (err) {
            setError('Error al cargar un chiste')
            console.error(err)
        } finally {
            setLoadingRandomFact(false)
        }
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setLoadingSearch(true)
        setError(null)
        try {
            const response = await api.chuckNorris.searchFacts({ query: searchQuery })
            setSearchResults(response.data)
        } catch (err) {
            setError('Erro al buscar chistes')
            console.error(err)
        } finally {
            setLoadingSearch(false)
        }
    }

    const handleCategoryClick = (category) => {
        const newCategory = selectedCategory === category ? null : category
        setSelectedCategory(newCategory)
        fetchRandomFact(newCategory)
    }

    return (
        <div className="home-container">

            {/* Search Bar */}
            <section className="search-section">
                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        placeholder="Busca chistes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button 
                        type="submit" 
                        className="search-btn"
                        disabled={loadingSearch || !searchQuery.trim()}
                    >
                        <SearchIcon />
                        Buscar
                    </button>
                </form>
            </section>

            {/* Error Message */}
            {error && (
                <div className="error-message">{error}</div>
            )}

            {/* Categories */}
            <section className="categories-section">
                <h2>Categorias</h2>
                {loadingCategories ? (
                    <div className="loading">Cargando categorias...</div>
                ) : (
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Random Fact */}
            <section className="random-fact-section">
                <div className="random-fact-header">
                    <h2>Chiste random {selectedCategory && `(${selectedCategory})`}</h2>
                    <button 
                        onClick={() => fetchRandomFact()} 
                        className="refresh-btn"
                        disabled={loadingRandomFact}
                    >
                        <RefreshIcon />
                        Actualizar
                    </button>
                </div>

                {loadingRandomFact ? (
                    <div className="loading">Loading...</div>
                ) : randomFact ? (
                    <FactCard
                        fact={randomFact.value}
                        icon_url={randomFact.icon_url}
                        categories={randomFact.categories}
                    />
                ) : null}

            </section>

            {/* Search Results */}
            {searchResults && (
                <section className="search-results-section">
                    <h2>Search Results</h2>
                    <p className="search-results-info">
                        Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                    {searchResults.result.length === 0 ? (
                        <div className="no-results">No facts found. Try a different search term.</div>
                    ) : (
                        <div className="facts-grid">
                            {searchResults.result.map((joke) => (
                                <FactCard
                                    key={joke.id}
                                    fact={joke.value}
                                    icon_url={joke.icon_url}
                                    categories={joke.categories}
                                    url={joke.url}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}

export default Home
