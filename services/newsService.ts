interface NewsArticle {
  id: string
  title: string
  description: string
  content?: string
  author?: string
  source: string
  url: string
  imageUrl?: string
  publishedAt: string
  category?: string
}

export class NewsService {
  private static instance: NewsService
  private cache = new Map<string, { data: NewsArticle[]; timestamp: number }>()
  private readonly CACHE_DURATION = 900000 // 15 minutes
  private readonly BASE_URL = 'https://newsapi.org/v2'

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService()
    }
    return NewsService.instance
  }

  private getApiKey(): string | null {
    return process.env.NEWS_API_KEY || null
  }

  async getTopHeadlines(
    category?: string, 
    country: string = 'us', 
    pageSize: number = 20
  ): Promise<NewsArticle[]> {
    const cacheKey = `headlines_${category || 'general'}_${country}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        return this.getMockNews(category)
      }

      const params = new URLSearchParams({
        apiKey,
        country,
        pageSize: pageSize.toString()
      })

      if (category && category !== 'general') {
        params.append('category', category)
      }

      const response = await fetch(`${this.BASE_URL}/top-headlines?${params}`)
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      const articles = this.parseArticles(data.articles, category)
      
      this.cache.set(cacheKey, { data: articles, timestamp: Date.now() })
      return articles
    } catch (error) {
      console.error('Error fetching news:', error)
      return this.getMockNews(category)
    }
  }

  async searchNews(
    query: string, 
    sortBy: 'relevancy' | 'popularity' | 'publishedAt' = 'publishedAt',
    pageSize: number = 20
  ): Promise<NewsArticle[]> {
    const cacheKey = `search_${query}_${sortBy}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        return this.getMockNews()
      }

      const params = new URLSearchParams({
        apiKey,
        q: query,
        sortBy,
        pageSize: pageSize.toString(),
        language: 'en'
      })

      const response = await fetch(`${this.BASE_URL}/everything?${params}`)
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      const articles = this.parseArticles(data.articles)
      
      this.cache.set(cacheKey, { data: articles, timestamp: Date.now() })
      return articles
    } catch (error) {
      console.error('Error searching news:', error)
      return this.getMockNews()
    }
  }

  private parseArticles(articles: any[], category?: string): NewsArticle[] {
    return articles
      .filter(article => article.title && article.title !== '[Removed]')
      .map(article => ({
        id: this.generateId(article.url),
        title: article.title,
        description: article.description || '',
        content: article.content,
        author: article.author,
        source: article.source?.name || 'Unknown',
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        category: category
      }))
  }

  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16)
  }

  private getMockNews(category?: string): NewsArticle[] {
    const mockArticles = [
      {
        id: 'mock1',
        title: 'Tech Giants Report Strong Q4 Earnings',
        description: 'Major technology companies exceed analyst expectations with robust quarterly results.',
        source: 'TechNews',
        url: 'https://example.com/tech-earnings',
        imageUrl: 'https://via.placeholder.com/400x200?text=Tech+News',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: category || 'technology'
      },
      {
        id: 'mock2',
        title: 'Global Climate Summit Reaches Historic Agreement',
        description: 'World leaders commit to ambitious new targets for carbon emission reductions.',
        source: 'Global News',
        url: 'https://example.com/climate-summit',
        imageUrl: 'https://via.placeholder.com/400x200?text=Climate+News',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: category || 'science'
      },
      {
        id: 'mock3',
        title: 'Stock Market Hits New All-Time High',
        description: 'Major indices reach record levels amid positive economic indicators.',
        source: 'Financial Times',
        url: 'https://example.com/market-high',
        imageUrl: 'https://via.placeholder.com/400x200?text=Finance+News',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: category || 'business'
      },
      {
        id: 'mock4',
        title: 'Breakthrough in Quantum Computing Announced',
        description: 'Researchers achieve significant milestone in quantum processor development.',
        source: 'Science Daily',
        url: 'https://example.com/quantum-breakthrough',
        imageUrl: 'https://via.placeholder.com/400x200?text=Science+News',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: category || 'science'
      },
      {
        id: 'mock5',
        title: 'New Electric Vehicle Model Sets Range Record',
        description: 'Latest EV technology promises over 500 miles on a single charge.',
        source: 'Auto World',
        url: 'https://example.com/ev-record',
        imageUrl: 'https://via.placeholder.com/400x200?text=Auto+News',
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        category: category || 'technology'
      }
    ]

    return mockArticles.slice(0, 10)
  }
}