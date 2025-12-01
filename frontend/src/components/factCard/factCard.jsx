import { useState } from 'react'
import { LANGUAGES } from '../../lib/languages'
import './factCard.css'
import { useEffect } from 'react'

const FactCard = ({ fact, onTranslate, onMarkAsSeen }) => {
    const [translating, setTranslating] = useState(false)
    const [currentLang, setCurrentLang] = useState('en')
    const [currentText, setCurrentText] = useState(fact.value)

    useEffect(() => {
        console.log(fact)
    }, [fact])

    const getTimeAgo = (d) => {
        const date = new Date(d)
        const minsSinceDate = (Date.now() - date.getTime()) / (1000 * 60)

        if (minsSinceDate < 1) {
            return 'Ahora';
        } else if (minsSinceDate < 60) {
            return 'Hace ' + Math.floor(minsSinceDate) + 'min'
        } else if (minsSinceDate < 24 * 60) {
            return 'Hace ' + Math.floor(minsSinceDate / 60) + 'h'
        } else if (minsSinceDate < 30 * 24 * 60) {
            return 'Hace ' + Math.floor(minsSinceDate / (24 * 60)) + 'd'
        } else if (minsSinceDate < 12 * 30 * 24 * 60) {
            return 'Hace ' + Math.floor(minsSinceDate / (30 * 24 * 60)) + 'm'
        }

        return Math.floor(minsSinceDate / (12 * 30 * 24 * 60)) + 'a'
    }

    const handleTranslate = async (targetLang) => {
        if (targetLang === currentLang) return
        
        setTranslating(true)
        try {
            const translatedText = await onTranslate(fact.value, targetLang, currentLang)
            setCurrentText(translatedText)
            setCurrentLang(targetLang)
            
            // Mark as seen in the new language
            if (onMarkAsSeen) {
                await onMarkAsSeen(fact.id, targetLang)
            }
        } catch (error) {
            console.error('Translation error:', error)
        } finally {
            setTranslating(false)
        }
    }


    return (
        <div className="fact-card">

            <div className="fact-card-header">
                {fact.icon_url && (
                    <img
                        src={fact.icon_url}
                        alt="Chuck Norris"
                        className="fact-card-icon"
                    />
                )}
                <p className="fact-card-text">{currentText}</p>
            </div>

            <div className="fact-card-footer">
                <div className="language-selector">
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                        <button
                            key={code}
                            className={`lang-btn ${currentLang === code ? 'active' : ''}`}
                            onClick={() => handleTranslate(code)}
                            disabled={translating || currentLang === code}
                            title={name}
                        >
                            {code.toUpperCase()}
                        </button>
                    ))}
                </div>

                {fact.categories.length > 0 && (
                    <div className="fact-card-categories">
                        {fact.seen && (<>
                            <code className='fact-category-badge seen'>Visto: {getTimeAgo(fact.ts)}</code>
                            {fact.lang.map((f) => {
                                return <code key={f} className='fact-category-badge lang'>{f.toUpperCase()}</code>
                            })}
                        </>)}
                        
                        {fact.categories.map((category, index) => (
                            <code key={index} className="fact-category-badge">
                                {category}
                            </code>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FactCard
