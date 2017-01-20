class Board 
{
	public static NUM_BIRDS:number = 64;
	public static BOARD_WIDTH:number = 8;
	public static BOARD_HEIGHT:number = 8;
	
	public static NEIGHBOR_N:number =   -Board.BOARD_WIDTH;
	public static NEIGHBOR_NN:number =  -Board.BOARD_WIDTH - Board.BOARD_WIDTH;
	public static NEIGHBOR_NNN:number = -Board.BOARD_WIDTH - Board.BOARD_WIDTH - Board.BOARD_WIDTH;
	public static NEIGHBOR_NW:number =  -Board.BOARD_WIDTH - 1;
	public static NEIGHBOR_NE:number =  -Board.BOARD_WIDTH + 1;
	public static NEIGHBOR_NEE:number = -Board.BOARD_WIDTH + 2;
	public static NEIGHBOR_NNE:number = -Board.BOARD_WIDTH - Board.BOARD_WIDTH + 1;
	public static NEIGHBOR_NWW:number = -Board.BOARD_WIDTH - 2;
	public static NEIGHBOR_NNW:number = -Board.BOARD_WIDTH - Board.BOARD_WIDTH - 1;
	
	public static NEIGHBOR_S:number = 8;
	public static NEIGHBOR_SS:number = 16;
	public static NEIGHBOR_SSS:number = 24;
	public static NEIGHBOR_SE:number = 9;
	public static NEIGHBOR_SW:number = 7;
	public static NEIGHBOR_SSE:number = 17;
	public static NEIGHBOR_SSW:number = 15;
	public static NEIGHBOR_SWW:number = 6;
	
	public static NEIGHBOR_E:number = 1;
	public static NEIGHBOR_EE:number = 2;
	public static NEIGHBOR_EEE:number = 3;
	
	public static NEIGHBOR_W:number = -1;
	public static NEIGHBOR_WW:number = -2;
	public static NEIGHBOR_WWW:number = -3;
	public static NEIGHBOR_SEE:number = 10;
	
	public birdCount:number;
	public mBirds:Tile[];
	public freshBirds:Tile[];
	
	private mMatcher:Matcher;
	private mMatches:Match[];
	private mRandom:Random;
	private mTempMatches:Match[];
	private mTempBirds:Tile[];
	private mDeadBirds:number;
	private mBirdMap:any;
	private mMoves:MoveData[];
	private mBirdPool:TilePool;
	private mActiveCounter:number;

	public constructor(generator:Random)
	{
		this.freshBirds = [];
		this.mMatcher = new Matcher();
		this.mMatches = [];
		this.mMoves = [];
		this.mTempBirds = [];
		this.mTempMatches = [];
		this.mBirdPool = new TilePool();
		this.mBirds = [];
		this.mRandom = generator;
		this.Reset();
	}

	public get birdsCleared():number
	{
		return this.mDeadBirds;
	}
	
	public  get activeCounter():number
	{
		return ++this.mActiveCounter;
	}
	
	public  get numColumns():number
	{
		return Board.BOARD_WIDTH;
	}
	
	public  get numRows():number
	{
		return Board.BOARD_HEIGHT;
	}
	
	public  get numBirds():number
	{
		return Board.NUM_BIRDS
	}
	
	public  Reset():void
	{
		this.birdCount = 0;
		this.freshBirds.length = 0;
		this.mMatches.length = 0;
		this.mMoves.length = 0;
		this.mActiveCounter = 0;
		for (var i:number = 0; i < this.mBirds.length; i++)
		{
			this.mBirds[i] = null;
		}
		this.mMatcher.Reset();
		this.mBirdMap = {};
		this.mDeadBirds = 0;
		this.mRandom.Reset();
	}
	
	public  fillInBlanks(allowCascades:boolean, bumps:number[]):void
	{
		var lowest:number;
		var hasBirds:boolean;
		var seenBirds:boolean;
		var row:number;
		var index:number;
		var matches:MatchSet[];
		this.freshBirds.length = 0;
		var bird:Tile;
		var numBirds:number = this.mBirds.length;
		var i:number;
		for (i = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			if (bird != null)
			{
				if (bird.fuseTime > 0 || bird.isDetonating)
					return;
			}
			
		}
		this.DropBirds();
		//以下处理了开始时空的时候生成所有的bird
		for (i = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			if (bird != null && bird.mIsSwapping)
				return;
		}
		var col:number = 0;
		while (col < Board.BOARD_WIDTH)
		{
			lowest = -2;
			hasBirds = false;
			seenBirds = false;
			row = Board.BOARD_HEIGHT - 1;
			while (row >= 0)
			{
				index = row * Board.BOARD_WIDTH + col;
				bird = this.mBirds[index];
				if (bird != null)
				{
					hasBirds = true;
					break;
				}
				row--;
			}
			row = Board.BOARD_HEIGHT - 1;
			while (row >= 0)
			{
				index = row * Board.BOARD_WIDTH + col;
				bird = this.mBirds[index];
				if (bird != null)
					seenBirds = true;
				else
				{
					if (hasBirds && !seenBirds)
					{
						
					}
					else
					{
						bird = this.mBirdPool.allocTile();
						bird.mBirdId = this.birdCount++;
						bird.reset();
						bird.mRow = row;
						bird.mCol = col;
						bird.mX = col;
						bird.mY = lowest;
						bird.mActiveCount = this.activeCounter;
						bird.mFallVelocity = 0;
						this.mBirdMap[bird.mBirdId] = bird;
						lowest = lowest - 2;
						this.mBirds[index] = bird;
						this.freshBirds.push(bird);
					}
				}
				row--;
			}
			col++;
		}
		if (this.freshBirds.length == 0)
			return;
		//随机生成颜色
		var done:boolean;
		var hasMove:boolean;
		var count:number;
		var numRefresh:number = 0;
		while (!done)
		{
			numRefresh++;
			this.randomizeColors(this.freshBirds);
			if (!allowCascades)
			{
				matches = this.findMatches();
				if (matches.length == 0)
				{
					console.log("ccccccccccccc")
					done = true;//???? 新生成的宝石不会出现匹配的
				}
				else
				{
					console.log("aaaaaaaaa",numRefresh);
					if(numRefresh == 150)
					{
						//如果走到这说明随机150次都出现了有匹配的，此时要么随机算法的bug，要么宝石颜色太少
						console.log("aaaaaaaaaaaaabug")
						done = true;
					}
				}
				
			}
			else
			{
				//有可移动的
				if (this.FindAllMoves(this.mBirds).length > 0)
				{
					hasMove = true;
					done = true;
					break;
				}
				//没有可移动的重新随机，如果随机了150次还没有可移动的，就算了吧
				count++;
				if (count == 150 && allowCascades)
					done = true;
			}
		}
	}
	
	public  DropBirds():void
	{
		var foundEmpty:boolean;
		var emptyRow:number;
		var row:number;
		var index:number;
		var bird:Tile;
		var emptyIndex:number;
		var col:number = 0;
		while (col < Board.BOARD_WIDTH)
		{
			foundEmpty = false;
			emptyRow = Board.BOARD_HEIGHT;//记录了空的位置
			row = Board.BOARD_HEIGHT - 1;
			while (row >= 0)
			{
				index = row * Board.BOARD_WIDTH + col;
				bird = this.mBirds[index];
				if (bird != null && bird.isDead)
					this.mDeadBirds++;
				if (bird == null || bird.isDead)
					this.mBirds[index] = null;
				else
				{
					emptyRow--;
					if (bird.mRow == emptyRow)
					{
						
					}
					else
					{
						this.mBirds[index] = null;
						bird.mRow = emptyRow;
						bird.mActiveCount = this.activeCounter;
						emptyIndex = emptyRow * Board.BOARD_WIDTH + col;
						this.mBirds[emptyIndex] = bird;
					}
				}
				row--;
			}
			col++;
		}
		
	}
	
	public  FindAllMoves(birds:Tile[]):MoveData[]
	{
		var bird:Tile;
		this.mMoves.length = 0;
		var len:number = birds.length;
		for ( var i:number = 0; i < Board.NUM_BIRDS; i++)
		{
			bird = birds[i];
			bird.mHasMove = false;
			this.FindMoves(bird, this.mMoves);
		}
		return this.mMoves;
	}
	
	public  FindMoves(bird:Tile, moves:MoveData[]):void
	{
		var aMove:MoveData;
		var row:number = bird.mRow;
		var col:number = bird.mCol;
		var index:number = row * Board.BOARD_WIDTH + col;
		if (bird.mType == Tile.TYPE_RAINBOW)
		{
			bird.mHasMove = true;
			aMove = MovePool.allocMove();
			aMove.sourceBird = bird;
			aMove.sourcePos.x = col;
			aMove.sourcePos.y = row;
			moves.push(aMove);
			return;
		}
		var nnn:boolean = row > 2 && this.mBirds[index + Board.NEIGHBOR_NNN].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NNN].mColor == bird.mColor;
		var nnw:boolean = row > 1 && col > 0 && this.mBirds[index + Board.NEIGHBOR_NNW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NNW].mColor == bird.mColor;
		var nn:boolean = row > 1 && this.mBirds[index + Board.NEIGHBOR_NN].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NN].mColor == bird.mColor;
		var nne:boolean = row > 1 && col < Board.BOARD_WIDTH - 1 && this.mBirds[index + Board.NEIGHBOR_NNE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NNE].mColor == bird.mColor;
		var nww:boolean = row > 0 && col > 1 && this.mBirds[index + Board.NEIGHBOR_NWW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NWW].mColor == bird.mColor;
		var nw:boolean = row > 0 && col > 0 && this.mBirds[index + Board.NEIGHBOR_NW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NW].mColor == bird.mColor;
		var ne:boolean = row > 0 && col < Board.BOARD_WIDTH - 1 && this.mBirds[index + Board.NEIGHBOR_NE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NE].mColor == bird.mColor;
		var nee:boolean = row > 0 && col < Board.BOARD_WIDTH - 2 && this.mBirds[index + Board.NEIGHBOR_NEE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_NEE].mColor == bird.mColor;
		var www:boolean = col > 2 && this.mBirds[index + Board.NEIGHBOR_WWW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_WWW].mColor == bird.mColor;
		var ww:boolean = col > 1 && this.mBirds[index + Board.NEIGHBOR_WW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_WW].mColor == bird.mColor;
		var ee:boolean = col < Board.BOARD_WIDTH - 2 && this.mBirds[index + Board.NEIGHBOR_EE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_EE].mColor == bird.mColor;
		var eee:boolean = col < Board.BOARD_WIDTH - 3 && this.mBirds[index + Board.NEIGHBOR_EEE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_EEE].mColor == bird.mColor;
		var sww:boolean = row < Board.BOARD_HEIGHT -1 && col > 1&& this.mBirds[index + Board.NEIGHBOR_SWW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SWW].mColor == bird.mColor;
		var sw:boolean = row < Board.BOARD_HEIGHT - 1 && col > 0&& this.mBirds[index + Board.NEIGHBOR_SW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SW].mColor == bird.mColor;
		var se:boolean = row < Board.BOARD_HEIGHT - 1 && col < Board.BOARD_WIDTH -1 && this.mBirds[index + Board.NEIGHBOR_SE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SE].mColor == bird.mColor;
		var see:boolean = row < Board.BOARD_HEIGHT - 1 && col < Board.BOARD_WIDTH - 2 && this.mBirds[index + Board.NEIGHBOR_SEE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SEE].mColor == bird.mColor;
		var ssw:boolean = row < Board.BOARD_HEIGHT - 2 && col > 0&& this.mBirds[index + Board.NEIGHBOR_SSW].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SSW].mColor == bird.mColor;
		var ss:boolean = row < Board.BOARD_HEIGHT - 2 && this.mBirds[index + Board.NEIGHBOR_SS].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SS].mColor == bird.mColor;
		var sse:boolean = row < Board.BOARD_HEIGHT - 2 && col < Board.BOARD_WIDTH - 1 && this.mBirds[index + Board.NEIGHBOR_SSE].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SSE].mColor == bird.mColor;
		var sss:boolean = row < Board.BOARD_HEIGHT - 3 && this.mBirds[index + Board.NEIGHBOR_SSS].mType != Tile.TYPE_RAINBOW && this.mBirds[index + Board.NEIGHBOR_SSS].mColor == bird.mColor;
		
		if ( ((nww && nw) || (nw && ne) || (ne && nee) || (nn && nnn)) && this.mBirds[index + Board.NEIGHBOR_N].mType != Tile.TYPE_RAINBOW)
		{
			bird.mHasMove = true;
			aMove = MovePool.allocMove();
			aMove.sourceBird = bird;
			aMove.sourcePos.x = col;
			aMove.sourcePos.y = row;
			aMove.isSwap = true;
			aMove.swapDir.x = 0;
			aMove.swapDir.y = -1;
			moves.push(aMove);
		}
		if (((nne && ne) || (ne && se) || (se && sse) || (ee && eee)) && this.mBirds[index + Board.NEIGHBOR_E].mType != Tile.TYPE_RAINBOW)
		{
			bird.mHasMove = true;
			aMove = MovePool.allocMove();
			aMove.sourceBird = bird;
			aMove.sourcePos.x = col;
			aMove.sourcePos.y = row;
			aMove.isSwap = true;
			aMove.swapDir.x = 1;
			aMove.swapDir.y = 0;
			moves.push(aMove);
		}
		if (((sww && sw) || (sw && se) || (se && see) || (ss && sss)) && this.mBirds[index + Board.NEIGHBOR_S].mType != Tile.TYPE_RAINBOW)
		{
			bird.mHasMove = true;
			aMove = MovePool.allocMove();
			aMove.sourceBird = bird;
			aMove.sourcePos.x = col;
			aMove.sourcePos.y = row;
			aMove.isSwap = true;
			aMove.swapDir.x = 0;
			aMove.swapDir.y = 1;
			moves.push(aMove);
		}
		if (((nnw && nw) || (nw && sw) || (sw && ssw) || (ww && www)) && this.mBirds[index + Board.NEIGHBOR_W].mType != Tile.TYPE_RAINBOW)
		{
			bird.mHasMove = true;
			aMove = MovePool.allocMove();
			aMove.sourceBird = bird;
			aMove.sourcePos.x = col;
			aMove.sourcePos.y = row;
			aMove.isSwap = true;
			aMove.swapDir.x = -1;
			aMove.swapDir.y = 0;
			moves.push(aMove);
		}
	}
	
	public  findMatches():MatchSet[]
	{
		var aOtherMatch:Match;
		var aSet:MatchSet;
		var probe:Match;
		var overlaps:Match[];
		var aNumOverlaps:number;
		var row:number;
		var col:number;
		var aBird:Tile;
		var anIndex:number;
		var aMatch:Match;
		var matches:Match[] = this.mTempMatches;
		matches.length = 0;
		for(let i:number = 0, len:number = this.mBirds.length; i < len; i++)
		{
			aBird = this.mBirds[i];
			if (aBird == null)
			{
				
			}
			else
			{
				aBird.mHasMatch = false;
			}
		}
		//横着找
		for (row = 0; row < Board.NUM_BIRDS; row += Board.BOARD_WIDTH)
		{
			this.mMatcher.start(this.mBirds[row]);
			for (col = 1; col < Board.BOARD_WIDTH; col++)
			{
				anIndex = row + col;
				aBird = this.mBirds[anIndex];
				aMatch = this.mMatcher.push(aBird);
				if (aMatch != null)
				{
					matches.push(aMatch);
					for(let i:number = 0, len:number = aMatch.mBirds.length; i < len; i++)
					{
						aBird = aMatch.mBirds[i];
						aBird.mHasMatch = true;
					}
				}
			}
			aMatch = this.mMatcher.end();
			if (aMatch != null)
				matches.push(aMatch);
		}
		
		//竖着找
		for (col = 0; col < Board.BOARD_WIDTH; col++)
		{
			this.mMatcher.start(this.mBirds[col]);
			for (row = Board.BOARD_WIDTH; row < Board.NUM_BIRDS; row += Board.BOARD_WIDTH)
			{
				anIndex = row + col;
				aBird = this.mBirds[anIndex];
				aMatch = this.mMatcher.push(aBird);
				if (aMatch != null)
				{
					matches.push(aMatch);
					for(let i:number = 0, len:number = aMatch.mBirds.length; i < len; i++)
					{
						aBird = aMatch.mBirds[i];
						aBird.mHasMatch = true;
					}
				}
			}
			aMatch = this.mMatcher.end();
			if (aMatch != null)
				matches.push(aMatch);
		}
		//排重
		let aNumMatches:number = matches.length;
		var i:number;
		var k:number;
		for (i = 0; i < aNumMatches; i++)
		{
			aMatch = matches[i];
			for ( k = i + 1; k < aNumMatches; k++)
			{
				aOtherMatch = matches[k];
				if (aMatch.isOverlapping(aOtherMatch))
				{
					aMatch.mOverlaps.push(aOtherMatch);
					aOtherMatch.mOverlaps.push(aMatch);
				}
			}
		}
		
		let matchSets:MatchSet[] = [];
		var queue:Match[] = [];
		for ( i = 0; i < aNumMatches; i++)
		{
			aMatch = matches[i];
			if (aMatch.mSet != null)
			{
				
			}
			else
			{
				aSet = new MatchSet();
				queue.length = 0;
				queue.push(aMatch);
				while (queue.length > 0)
				{
					probe = queue.shift();
					if (probe.mSet == null)
					{
						aSet.mMatches.push(probe);
						probe.mSet = aSet;
						overlaps = probe.mOverlaps;
						aNumOverlaps = overlaps.length;
						for ( k = 0; k < aNumOverlaps; k++)
						{
							queue.push(overlaps[k]);
						}
					}
				}
				aSet.resolve();
				matchSets.push(aSet);
			}
		}
		return matchSets;
	}
	
	public  getColor(color:number):Tile[]
	{
		var bird:Tile;
		var birds:Tile[] = [];
		var numBirds:number = this.mBirds.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			if (bird != null)
			{
				if (color == Tile.COLOR_NONE)
					birds.push(bird);
				else
				{
					if (bird.mColor == color && bird.mType != Tile.TYPE_RAINBOW)
					{
						birds.push(bird);
					}
				}
			}
		}
		return birds;
	}
	
	public  isStill():boolean
	{
		var bird:Tile;
		for ( var i:number = 0; i < Board.NUM_BIRDS; i++)
		{
			bird = this.mBirds[i];
			if (bird == null || !bird.isStill())
				return false;
		}
		return true;
	}
	
	public  isIdle():boolean
	{
		var bird:Tile;
		for ( var i:number = 0; i < Board.NUM_BIRDS; i++)
		{
			bird = this.mBirds[i];
			if (bird == null || !bird.isIdle())
				return false;
		}
		return true;
	}
	
	private  randomColor():number
	{
		var index:number = this.mRandom.Int(Tile.BIRD_COLORS.length);
		return Tile.BIRD_COLORS[index];
	}
	
	private  randomizeColors(birds:Tile[]):void
	{
		var bird:Tile;
		var numBirds:number = birds.length;
		for ( var i:number = 0; i < numBirds; i++)
		{
			bird = birds[i];
			bird.mColor = this.randomColor();
		}
	}
	
	public  getBird(row:number, col:number):Tile
	{
		if (row < 0 || col < 0 || row >= Board.BOARD_HEIGHT || col >= Board.BOARD_WIDTH)
			return null;
		var index:number = row * Board.BOARD_WIDTH + col;
		return this.mBirds[index];
	}
	
	public  GetBirdById(id:number):Tile
	{
		return this.mBirdMap[id];
	}
	
	public  clearBirds(birds:Tile[]):void
	{
		var bird:Tile;
		var numBirds:number = birds.length;
		for ( var i:number = 0; i < numBirds; i++)
		{
			bird = birds[i];
			bird.isDead = true;
		}
	}
	
	public  swapBirds(a:Tile, b:Tile):void
	{
		var index1:number = a.mRow * Board.BOARD_WIDTH + a.mCol;
		var index2:number = b.mRow * Board.BOARD_WIDTH + b.mCol;
		this.mBirds[index1] = b;
		this.mBirds[index2] = a;
		var tRow:number = a.mRow;
		var tCol:number = a.mCol;
		a.mRow = b.mRow;
		a.mCol = b.mCol;
		b.mRow = tRow;
		b.mCol = tCol;
		b.mActiveCount = this.activeCounter;
		a.mActiveCount = this.activeCounter;
	}
}