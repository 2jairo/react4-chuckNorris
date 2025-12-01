import './factCard.css'

const FactCard = ({ fact }) => {
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
                <p className="fact-card-text">{fact.value}</p>
            </div>

            {fact.categories.length > 0 && (
                <div className="fact-card-categories">
                    {fact.seen && (<>
                        <code className='fact-category-badge seen'>Visto: {getTimeAgo(fact.ts)}</code>
                        <code className='fact-category-badge lang'>{fact.lang}</code>
                    </>)}
                    
                    {fact.categories.map((category, index) => (
                        <code key={index} className="fact-category-badge">
                            {category}
                        </code>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FactCard
