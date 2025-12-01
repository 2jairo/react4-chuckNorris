import { useContext } from "react"
import { useMemo } from "react"
import { JwtContext } from "../providers/jwt/jwtContext"
import axios from 'axios'

/**
 * @typedef {Object} Joke
 * @property {string[]} categories - Categories assigned to the joke (may be empty).
 * @property {string} created_at - Creation timestamp of the joke.
 * @property {string} icon_url - URL to the joke's icon/avatar.
 * @property {string} id - Unique identifier for the joke.
 * @property {string} updated_at - Last update timestamp of the joke.
 * @property {string} url - API URL for the joke.
 * @property {string} value - The joke text (the actual Chuck Norris fact).
 */
/**
 * @typedef {Object} Fact
 * @property {number} user_id - ID of the user who saved the fact.
 * @property {string} fact_id - External/remote fact identifier.
 * @property {string} lang - Language code for the fact.
 * @property {Date} ts - Timestamp when the fact was created/saved.
 */

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

        /** @returns {Promise<import('axios').AxiosResponse<{ username: string, id: number }>>} */
        const getUserProfile = () => {
            return localApi.get('/api/auth/profile')   
        }

        /** @returns {Promise<import('axios').AxiosResponse<{ token: string, user: { username: string, id: number }}>>} */
        const login = ({ username, password }) => {
            return localApi.post('/api/auth/login', { username, password })
        }

        /** @returns {Promise<import('axios').AxiosResponse<{ token: string, user: { username: string, id: number }}>>} */
        const signin = ({ username, password }) => {
            return localApi.post('/api/auth/signin', { username, password })
        }

        /** @returns {Promise<import('axios').AxiosResponse<{ facts: Fact[] }>>} */
        const markAsSeen = (facts) => {
            return localApi.post('/api/facts/mark-as-seen', { facts })
        }

        // chucknorris
        const chuckNorris = axios.create({
            baseURL: 'https://api.chucknorris.io'
        })
    
        /** @returns {Promise<import('axios').AxiosResponse<string[]>>} */
        const getCategories = () => {
            return chuckNorris.get('/jokes/categories') // string[]
        }

        /** @returns {Promise<import('axios').AxiosResponse<Joke>>} */
        const getRandomFact = async ({ category }) => {
            const url = category ? `/jokes/random?category=${category}` : '/jokes/random'
            return await chuckNorris.get(url)
        }

        /** @returns {Promise<import('axios').AxiosResponse<{ result: Joke[], total: number }>>} */
        const searchFacts = ({ query }) => {
            return chuckNorris.get(`/jokes/search?query=${query}`)
        }


        return {
            local: {
                getUserProfile,
                login,
                signin,
                markAsSeen,
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
