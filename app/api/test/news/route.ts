import { NextResponse } from 'next/server'
import { NewsService } from '@/services/newsService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('query') || undefined
  const country = searchParams.get('country') || 'us'
  const limit = parseInt(searchParams.get('limit') || '10')
  
  try {
    const newsService = NewsService.getInstance()
    
    let data
    let action
    
    if (query) {
      action = 'search'
      data = await newsService.searchNews(query, 'publishedAt', limit)
    } else {
      action = 'headlines'
      data = await newsService.getTopHeadlines(category, country, limit)
    }
    
    return NextResponse.json({
      status: 'success',
      action,
      category: category || 'general',
      query,
      country,
      data,
      usingNewsAPI: !!process.env.NEWS_API_KEY,
      newsAPIKeyPresent: !!process.env.NEWS_API_KEY,
      dataSource: process.env.NEWS_API_KEY ? 'News API' : 'Mock Data',
      totalArticles: data.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      category,
      query,
      error: error instanceof Error ? error.message : 'Unknown error',
      usingNewsAPI: !!process.env.NEWS_API_KEY,
      newsAPIKeyPresent: !!process.env.NEWS_API_KEY
    }, { status: 500 })
  }
}