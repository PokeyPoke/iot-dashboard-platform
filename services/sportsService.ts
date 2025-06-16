interface SportsGame {
  id: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  gameTime: string
  status: 'upcoming' | 'live' | 'completed'
  homeScore?: number
  awayScore?: number
  odds?: {
    homeWin: number
    awayWin: number
    draw?: number
    spread?: {
      home: { line: number; odds: number }
      away: { line: number; odds: number }
    }
    total?: {
      over: { line: number; odds: number }
      under: { line: number; odds: number }
    }
  }
}

interface Sport {
  key: string
  group: string
  title: string
  description: string
  active: boolean
  hasOutrights: boolean
}

export class SportsService {
  private static instance: SportsService
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 300000 // 5 minutes
  private readonly BASE_URL = 'https://api.the-odds-api.com/v4'

  static getInstance(): SportsService {
    if (!SportsService.instance) {
      SportsService.instance = new SportsService()
    }
    return SportsService.instance
  }

  private getApiKey(): string | null {
    return process.env.ODDS_API_KEY || null
  }

  async getSports(): Promise<Sport[]> {
    const cacheKey = 'sports'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        return this.getMockSports()
      }

      const response = await fetch(`${this.BASE_URL}/sports?apiKey=${apiKey}`)
      
      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching sports:', error)
      return this.getMockSports()
    }
  }

  async getGamesByLeague(league: string): Promise<SportsGame[]> {
    const cacheKey = `games_${league}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        return this.getMockGames(league)
      }

      // Get odds for upcoming games
      const oddsResponse = await fetch(
        `${this.BASE_URL}/sports/${league}/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=decimal&apiKey=${apiKey}`
      )
      
      let gamesData: SportsGame[] = []

      if (oddsResponse.ok) {
        const oddsData = await oddsResponse.json()
        gamesData = this.parseOddsData(oddsData, league)
      }

      // Get scores for recent/live games
      try {
        const scoresResponse = await fetch(
          `${this.BASE_URL}/sports/${league}/scores?daysFrom=1&apiKey=${apiKey}`
        )
        
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json()
          const scoreGames = this.parseScoresData(scoresData, league)
          
          // Merge scores with odds data
          gamesData = this.mergeGamesData(gamesData, scoreGames)
        }
      } catch (scoresError) {
        console.log('Scores API not available, using odds only')
      }

      this.cache.set(cacheKey, { data: gamesData, timestamp: Date.now() })
      return gamesData
    } catch (error) {
      console.error('Error fetching games:', error)
      return this.getMockGames(league)
    }
  }

  private parseOddsData(data: any[], league: string): SportsGame[] {
    return data.map(game => {
      const homeTeam = game.home_team
      const awayTeam = game.away_team
      
      // Extract odds from first available bookmaker
      let odds = undefined
      if (game.bookmakers && game.bookmakers.length > 0) {
        const bookmaker = game.bookmakers[0]
        odds = this.extractOdds(bookmaker.markets)
      }

      return {
        id: game.id,
        sport: game.sport_title || league,
        league: league.toUpperCase().replace(/_/g, ' '),
        homeTeam,
        awayTeam,
        gameTime: game.commence_time,
        status: 'upcoming' as const,
        odds
      }
    })
  }

  private parseScoresData(data: any[], league: string): SportsGame[] {
    return data.map(game => {
      const homeTeam = game.home_team
      const awayTeam = game.away_team
      const homeScore = game.scores?.find((s: any) => s.name === homeTeam)?.score
      const awayScore = game.scores?.find((s: any) => s.name === awayTeam)?.score

      return {
        id: game.id,
        sport: game.sport_title || league,
        league: league.toUpperCase().replace(/_/g, ' '),
        homeTeam,
        awayTeam,
        gameTime: game.commence_time,
        status: game.completed ? 'completed' as const : 'live' as const,
        homeScore: homeScore ? parseInt(homeScore) : undefined,
        awayScore: awayScore ? parseInt(awayScore) : undefined
      }
    })
  }

  private extractOdds(markets: any[]): any {
    const odds: any = {}

    markets.forEach(market => {
      if (market.key === 'h2h') {
        // Head-to-head (moneyline) odds
        const homeOutcome = market.outcomes.find((o: any) => o.name === market.outcomes[0].name)
        const awayOutcome = market.outcomes.find((o: any) => o.name === market.outcomes[1].name)
        const drawOutcome = market.outcomes.find((o: any) => o.name === 'Draw')

        odds.homeWin = homeOutcome?.price || 0
        odds.awayWin = awayOutcome?.price || 0
        if (drawOutcome) odds.draw = drawOutcome.price
      } else if (market.key === 'spreads') {
        // Point spread odds
        const homeOutcome = market.outcomes.find((o: any) => o.name === market.outcomes[0].name)
        const awayOutcome = market.outcomes.find((o: any) => o.name === market.outcomes[1].name)

        if (homeOutcome && awayOutcome) {
          odds.spread = {
            home: { line: homeOutcome.point, odds: homeOutcome.price },
            away: { line: awayOutcome.point, odds: awayOutcome.price }
          }
        }
      } else if (market.key === 'totals') {
        // Over/under total points
        const overOutcome = market.outcomes.find((o: any) => o.name === 'Over')
        const underOutcome = market.outcomes.find((o: any) => o.name === 'Under')

        if (overOutcome && underOutcome) {
          odds.total = {
            over: { line: overOutcome.point, odds: overOutcome.price },
            under: { line: underOutcome.point, odds: underOutcome.price }
          }
        }
      }
    })

    return odds
  }

  private mergeGamesData(oddsGames: SportsGame[], scoreGames: SportsGame[]): SportsGame[] {
    const merged = [...oddsGames]
    
    scoreGames.forEach(scoreGame => {
      const existingIndex = merged.findIndex(g => g.id === scoreGame.id)
      if (existingIndex >= 0) {
        // Update existing game with scores
        merged[existingIndex] = { ...merged[existingIndex], ...scoreGame }
      } else {
        // Add new game from scores
        merged.push(scoreGame)
      }
    })

    return merged.sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime())
  }

  private getMockSports(): Sport[] {
    return [
      { key: 'americanfootball_nfl', group: 'American Football', title: 'NFL', description: 'National Football League', active: true, hasOutrights: true },
      { key: 'basketball_nba', group: 'Basketball', title: 'NBA', description: 'National Basketball Association', active: true, hasOutrights: true },
      { key: 'baseball_mlb', group: 'Baseball', title: 'MLB', description: 'Major League Baseball', active: true, hasOutrights: true },
      { key: 'icehockey_nhl', group: 'Ice Hockey', title: 'NHL', description: 'National Hockey League', active: true, hasOutrights: true },
      { key: 'soccer_epl', group: 'Soccer', title: 'Premier League', description: 'English Premier League', active: true, hasOutrights: true }
    ]
  }

  private getMockGames(league: string): SportsGame[] {
    const teams = this.getTeamsForLeague(league)
    const games: SportsGame[] = []

    for (let i = 0; i < 8; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)]
      let awayTeam = teams[Math.floor(Math.random() * teams.length)]
      while (awayTeam === homeTeam) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)]
      }

      const gameTime = new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString()
      const isCompleted = Math.random() < 0.3
      const isLive = !isCompleted && Math.random() < 0.2

      games.push({
        id: `${league}_${i}`,
        sport: league.split('_')[1]?.toUpperCase() || 'SPORT',
        league: league.toUpperCase().replace(/_/g, ' '),
        homeTeam,
        awayTeam,
        gameTime,
        status: isCompleted ? 'completed' : isLive ? 'live' : 'upcoming',
        homeScore: isCompleted || isLive ? Math.floor(Math.random() * 30) + 70 : undefined,
        awayScore: isCompleted || isLive ? Math.floor(Math.random() * 30) + 70 : undefined,
        odds: !isCompleted ? {
          homeWin: 1.8 + Math.random() * 0.4,
          awayWin: 1.8 + Math.random() * 0.4,
          spread: {
            home: { line: -3.5, odds: 1.9 },
            away: { line: 3.5, odds: 1.9 }
          }
        } : undefined
      })
    }

    return games
  }

  private getTeamsForLeague(league: string): string[] {
    const teamMap: Record<string, string[]> = {
      'americanfootball_nfl': ['Kansas City Chiefs', 'Buffalo Bills', 'Green Bay Packers', 'Tampa Bay Buccaneers', 'Dallas Cowboys', 'New England Patriots'],
      'basketball_nba': ['Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors', 'Miami Heat', 'Chicago Bulls', 'New York Knicks'],
      'baseball_mlb': ['New York Yankees', 'Los Angeles Dodgers', 'Boston Red Sox', 'Chicago Cubs', 'San Francisco Giants', 'Atlanta Braves'],
      'icehockey_nhl': ['Toronto Maple Leafs', 'Boston Bruins', 'Pittsburgh Penguins', 'Tampa Bay Lightning', 'Vegas Golden Knights', 'Colorado Avalanche'],
      'soccer_epl': ['Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester United', 'Tottenham']
    }

    return teamMap[league] || ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F']
  }
}