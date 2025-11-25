import { useContext } from "react"
import { useMemo } from "react"
import { JwtContext } from "../providers/jwt/jwtContext"
import axios from 'axios'

export const useApi = () => {
    const { token } = useContext(JwtContext)
    
    const api = useMemo(() => {
        // local api
        const localApi = axios.create({
            baseURL: 'http://localhost:8900'
        })
        localApi.interceptors.request.use((conf) => {
            if(token) {
                conf.headers.set('Authorization', `Bearer ${token}`)
            }
            return conf
        })

        const getUserProfile = () => {
            return localApi.get('/api/auth/profile')   
        }
        const login = ({ username, password }) => {
            return localApi.post('/api/auth/login', { username, password })
        }
        const signin = ({ username, password }) => {
            return localApi.post('/api/auth/signin', { username, password })
        }
        const getSeenFacts = () => {
            return localApi.get('/api/facts/seen')
        }

        // chucknorris
        const chuckNorris = axios.create({
            baseURL: 'https://api.chucknorris.io'
        })
    
        const getCategories = () => {
            return chuckNorris.get('/jokes/categories')
        }
        const getRandomFact = ({ category }) => {
            const url = category ? `/jokes/random&category=${category}` : '/jokes/random'
            return chuckNorris.get(url)
        }
        const searchFacts = ({ query }) => {
            return chuckNorris.get(`/jokes/search?query=${query}`)
        }

        return {
            local: {
                getUserProfile,
                login,
                signin,
                getSeenFacts,
            },
            chuckNorris: {
                getCategories,
                getRandomFact,
                searchFacts
            }
        }        
    }, [token])

    
    return api
}
