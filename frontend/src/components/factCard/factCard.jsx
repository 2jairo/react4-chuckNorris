import './factCard.css'

const FactCard = ({ fact, icon_url, categories }) => {
    return (
        <div className="fact-card">
            <div className="fact-card-header">
                {icon_url && (
                    <img 
                        src={icon_url} 
                        alt="Chuck Norris" 
                        className="fact-card-icon"
                    />
                )}
                {categories.length > 0 && (
                    <div className="fact-card-categories">
                        {categories.map((category, index) => (
                            <span key={index} className="fact-category-badge">
                                {category}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <p className="fact-card-text">{fact}</p>
        </div>
    )
}

export default FactCard
