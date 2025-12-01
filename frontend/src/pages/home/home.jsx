import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import FactCard from '../../components/factCard/factCard'
import { RefreshIcon, SearchIcon } from '../../components/icons/icons'
import { DEFAULT_LANG } from '../../lib/languages'
import './home.css'


const Home = () => {
    const api = useApi()
    
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [randomFact, setRandomFact] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchQuery2, setSearchQuery2] = useState('')
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
            const seen = await api.local.markAsSeen([{ id: response.data.id, lang: DEFAULT_LANG }])

            setRandomFact({
                ...response.data,
                lang: seen.data.facts[0]?.lang || [DEFAULT_LANG],
                seen: seen.data.facts[0] ? true : false,
                ts: seen.data.facts[0]?.ts 
            })
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

        setSearchQuery2(searchQuery)
        setLoadingSearch(true)
        setError(null)
        try {
            const response = await api.chuckNorris.searchFacts({ query: searchQuery })
            const seen = await api.local.markAsSeen(response.data.result.map((f) => ({ id: f.id, lang: DEFAULT_LANG })))

            const result = response.data.result.map((f) => {
                const s = seen.data.facts.find((s) => s.fact_id === f.id)
                return {
                    ...f,
                    lang: s?.lang,
                    seen: s ? true : false,
                    ts: s?.ts
                }
            })

            console.log(result)
            setSearchResults({ result, total: response.data.total })
        } catch (err) {
            setError('Error al buscar chistes')
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

    const handleTranslate = async (text, targetLang, sourceLang) => {
        try {
            const response = await api.translate.translateText({
                text,
                targetLang,
                sourceLang
            })
            return response.data.translatedText
        } catch (error) {
            console.error('Translation failed:', error)
            throw error
        }
    }

    const handleMarkAsSeen = async (factId, lang, set) => {
        try {
            const resp = await api.local.markAsSeen([{ id: factId, lang }])
            if(resp.data.facts.length) {
                set(resp.data.facts[0])
            }
        } catch (error) {
            console.error('Mark as seen failed:', error)
        }
    }

    const updateSearchResultFact = (fId, newFact) => {
        setSearchResults((prev) => {
            return {
                result: [...prev.result.map((f => f.id === fId 
                    ? { ...f, seen: true, lang: newFact?.lang, ts: newFact?.ts } 
                    : f
                ))]
            }
        })
    }
    const updateRandomFact = (newFact) => {
        setRandomFact((prev) => ({
            ...prev,
            lang: newFact?.lang,
            seen: true,
            ts: newFact?.ts
        }))
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
                        fact={randomFact} 
                        onTranslate={handleTranslate} 
                        onMarkAsSeen={(fId, fLang) => handleMarkAsSeen(fId, fLang, updateRandomFact)} />
                ) : null}

            </section>

            {/* Search Results */}
            {searchResults && (
                <section className="search-results-section">
                    <h2>Resultados de búsqueda</h2>
                    <p className="search-results-info">
                        {searchResults.total} resultado{searchResults.total !== 1 ? 's' : ''} para "{searchQuery2}"
                    </p>
                    {searchResults.result.length === 0 ? (
                        <div className="no-results">No se encontraron chistes para {searchQuery2}</div>
                    ) : (
                        <div className="facts-grid">
                            {searchResults.result.map((joke) => (
                                <FactCard 
                                    key={joke.id} 
                                    fact={joke} 
                                    onTranslate={handleTranslate} 
                                    onMarkAsSeen={(fId, fLang) => handleMarkAsSeen(fId, fLang, (newF) => updateSearchResultFact(fId, newF))} 
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
