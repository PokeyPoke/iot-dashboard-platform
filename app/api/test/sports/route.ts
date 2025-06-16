import { NextResponse } from 'next/server'
import { SportsService } from '@/services/sportsService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || 'americanfootball_nfl'
  const action = searchParams.get('action') || 'games' // 'games' or 'sports'
  
  try {
    const sportsService = SportsService.getInstance()
    
    if (action === 'sports') {
      const data = await sportsService.getSports()
      
      return NextResponse.json({
        status: 'success',
        action: 'sports',
        data,
        usingOddsAPI: !!process.env.ODDS_API_KEY,
        oddsAPIKeyPresent: !!process.env.ODDS_API_KEY,
        dataSource: process.env.ODDS_API_KEY ? 'The Odds API' : 'Mock Data',
        totalSports: data.length,
        timestamp: new Date().toISOString()
      })
    } else {
      const data = await sportsService.getGamesByLeague(league)
      
      return NextResponse.json({
        status: 'success',
        action: 'games',
        league,
        data,
        usingOddsAPI: !!process.env.ODDS_API_KEY,
        oddsAPIKeyPresent: !!process.env.ODDS_API_KEY,
        dataSource: process.env.ODDS_API_KEY ? 'The Odds API' : 'Mock Data',
        totalGames: data.length,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      action,
      league: action === 'games' ? league : undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
      usingOddsAPI: !!process.env.ODDS_API_KEY,
      oddsAPIKeyPresent: !!process.env.ODDS_API_KEY
    }, { status: 500 })
  }
}