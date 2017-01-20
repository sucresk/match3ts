class Match3Logic 
{
	public static RANDOM:string = "random_png"
	public static ROWS:number = 8;
	public static COLS:number = 8;
	public static GRAVITY:number = 0.0021484375;
	public static MIN_VELO_TO_HIT:number = 0.015625;
	public static BASE_SPEED:number = 1;
	public static GAME_TIME:number = 6000;
	
	public static RANDOM_SEED:number = 2345;
	private static SHORT_HURRAH_DELAY:number = 25;
	private static BASE_HURRAH_DELAY:number = 175;

	public isPaused:boolean;
	public random:Random;
	public moves:MoveData[];
	public board:Board;
	public grid:TileGrid;
	public newMatches:Match[];
	public newMatchSets:MatchSet[];
	public matchCount:number;
	public startedMove:boolean;
	public badMove:boolean;
	public birdsHit:boolean;
	public isActive:boolean;

	private mColumnHighs:any[];
	private mGameOver:boolean;
	private mQueuedMoves:MoveData[];
	private mSwapData:SwapData[];
	private mBlockedEvents:IBirdEvent[];
	private mBlockingEvents:IBirdEvent[];
	private mPassiveEvents:IBirdEvent[];	
	private mNewEvents:IBirdEvent[];
	private mUpdateCount:number;
	private mGameTime:number;
	private mLastGameTime:number;
	private mLastHitTick:number;
	private mIsLastHurrah:boolean;
	private mHurrahDelay:number;
	private mBumpVelocities:number[];
	private mGameSpeed:number;
	private mSelected:Tile;
	private mFreshSelect:boolean;

	public constructor() 
	{
		this.random = new Random(Match3Logic.RANDOM_SEED, RES.getRes(Match3Logic.RANDOM));
		this.board = new Board(this.random);
		this.mColumnHighs = [];
		this.moves = [];
		this.grid = new TileGrid(Match3Logic.ROWS, Match3Logic.COLS);
		this.newMatches = [];
		this.newMatchSets = [];
		this.mQueuedMoves = [];
		this.mSwapData = [];
		this.mBlockedEvents = [];
		this.mBlockingEvents = [];
		this.mPassiveEvents = [];
		this.mNewEvents = [];
		this.mBumpVelocities = [];
		for(let i:number = 0; i < Board.BOARD_WIDTH; i++)
		{
			this.mBumpVelocities.push(0)
		}
		

		this.Reset();
	}

	public get gameTimeLeft():number
	{
		return this.mGameTime;
	}
	
	public get isGameOver():boolean
	{
		return this.mGameOver;
	}
	
	public get isLastHurrah():boolean
	{
		return this.mIsLastHurrah;
	}

	public Reset():void
	{
		this.isPaused = false;
		this.mGameOver = false;
		this.random.seed = new Date().getTime();
		this.mColumnHighs[0] = {moveId:-1, matchId:-1};
		this.mColumnHighs[1] = {moveId:-1, matchId:-1};
		this.mColumnHighs[2] = {moveId:-1, matchId:-1};
		this.mColumnHighs[3] = {moveId:-1, matchId:-1};
		this.mColumnHighs[4] = {moveId:-1, matchId:-1};
		this.mColumnHighs[5] = {moveId:-1, matchId:-1};
		this.mColumnHighs[6] = {moveId:-1, matchId:-1};
		this.mColumnHighs[7] = {moveId:-1, matchId:-1};
		this.moves.length = 0;
		this.board.Reset();
		this.grid.Reset();
		//scoreKeeper.Reset();
		//speedBonus.Reset();
		//multiLogic.Reset();
		//blazingSpeedBonus.Reset();
		//stats.Reset();
		//compliments.Reset();
		//starGemLogic.Reset();
		//rainbowGemLogic.Reset();
		//flameGemLogic.Reset();
		
		this.newMatches.length = 0;
		this.newMatchSets.length = 0;
		this.mQueuedMoves.length = 0;
		this.mSwapData.length = 0;
		this.mBlockingEvents.length = 0;
		this.mBlockedEvents.length = 0;
		this.mPassiveEvents.length = 0;
		this.mNewEvents.length = 0;
		this.matchCount = 0;
		this.mUpdateCount = 0;
		this.mGameTime = Match3Logic.GAME_TIME;
		this.mLastGameTime = 0;
		this.startedMove = false;
		this.badMove = false;
		this.birdsHit = false;
		this.mLastHitTick = 0;
		this.mIsLastHurrah = false;
		this.mHurrahDelay = Match3Logic.BASE_HURRAH_DELAY;
		for ( var i:number = 0; i < this.mBumpVelocities.length; i++)
		{
			this.mBumpVelocities[i] = 0;
		}
		this.mGameSpeed = Match3Logic.BASE_SPEED;
		this.mSelected = null;
		this.board.fillInBlanks(false, this.mBumpVelocities);
	}

	public Resume():void
	{
		
	}
	
	public update():void
	{
		this.mLastGameTime = this.mGameTime;
		this.birdsHit = false;
		if (this.mGameOver)
			return;
		this.startedMove = false;
		this.badMove = false;
		this.updateBirds();//
		this.UpdateEvents();//
		this.newMatchSets.length = 0;
		this.newMatches.length = 0;
		if (this.mBlockingEvents.length == 0)
		{
			if (!this.mIsLastHurrah)
				this.UpdateMoves();//生成swapdata交换
		}
		this.UpdateSwapping();//更新交换的过程
		if (this.mBlockingEvents.length == 0)
		{
			this.board.fillInBlanks(true, this.mBumpVelocities);//数据上填充空缺
			this.updateFalling(this.mGameSpeed);//宝石落下
		}
		else
		{
			this.clearBumps();//速度不小于0，消除抖动
		}
		this.updateMatches();//查找生成匹配
		if (this.mBlockingEvents.length == 0)
		{
			if (this.isActive && !this.mIsLastHurrah && this.mGameTime > 0)
			{
				this.mGameTime--;
			}
		}
		this.updateBirdPositions();//更新宝石在网格中的位置，宝石自己记录位置，网格也记录了宝石的位置
		//blazingSpeedBonus.DoExplosions(newMatches, this);
		//handleMatchedBirds();//
		this.handleDetonatedBirds();//
		let numMatches:number = this.newMatches.length;
		let j:number;
		let m:Match;
		for (j = 0; j < numMatches; j++)
		{
			m = this.newMatches[j];
			//this.starBirdLogic.HandleMatch(m);//处理5个十字形的匹配
		}
		for (j = 0; j < numMatches; j++)
		{
			m = this.newMatches[j];
			//rainbowLogic.HandleMatch(m);//处理4个的匹配
		}
		for (j = 0; j < numMatches; j++)
		{
			m = this.newMatches[j];
			//this.flameBirdLogic.HandleMatch(m);//处理4个的匹配
		}
		this.handleShatteredBirds();//
		this.handleDetonatedBirds();//
		this.InitializeEvents();//
		this.handleBirds();//
		this.resolveBirds();//
		this.propagateIds();//
		let isStill:boolean = this.board.isStill();
		//this.speedBonus.Update();
		//scoreKeeper.moveBonus = speedBonus.bonus;
		//scoreKeeper.Update();
		//multiLogic.Update();
		//blazingSpeedBonus.update(newMatches, this);
		//compliments.Update();
		this.UpdateLastHurrah();//
		this.mUpdateCount++;
	}

	private updateBirds():void
	{
		let bird:Tile;
		let birdss:Tile[] = this.board.mBirds;
		let numBirds:number = birdss.length;
		for (let i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null)
				bird.update();
		}
	}

	private UpdateEvents():void
	{
		this.UpdateBlockingEvents();
		if (this.mBlockingEvents.length == 0)
		{
			this.UpdateBlockedEvents();
		}	
		this.UpdatePassiveEvents();
	}

	private UpdateBlockingEvents():void
	{
		var e:IBirdEvent;
		var isEmpty:Boolean = true;
		for(let i:number = 0, len:number = this.mBlockingEvents.length; i < len; i++)
		{
			e = this.mBlockingEvents[i];
			e.Update(this.mGameSpeed);
			isEmpty = isEmpty && e.IsDone();
		}
		if (isEmpty)
		{
			this.mBlockingEvents.length = 0;
		}	
	}

	private UpdateBlockedEvents():void
	{
		var e:IBirdEvent;
		var isEmpty:Boolean = true;
		for(let i:number = 0, len = this.mBlockedEvents.length; i < len; i++)
		{ 
			e = this.mBlockedEvents[i];
			e.Update(this.mGameSpeed);
			isEmpty = isEmpty && e.IsDone();
		}
		if (isEmpty)
			this.mBlockedEvents.length = 0;
	}

	private UpdatePassiveEvents():void
	{
		var e:IBirdEvent;
		var isEmpty:Boolean = true;
		for(let i:number = 0, len:number = this.mPassiveEvents.length; i < len; i++)
		{
			e = this.mPassiveEvents[i];
			e.Update(this.mGameSpeed);
			isEmpty = isEmpty && e.IsDone();
		}
		if (isEmpty)
			this.mPassiveEvents.length = 0;
	}

	private UpdateMoves():void
	{
		var move:MoveData;
		while (this.mQueuedMoves.length > 0)
		{
			move = this.mQueuedMoves.shift();
			if (move.time <= this.mUpdateCount)
			{
				if (this.IsMoveLegal(move.sourceBird, move.swapPos.y, move.swapPos.x))
				{
					this.DoMove(move);
				}
			}
		}
		for(let i:number = 0, len:number = this.moves.length; i < len; i++)
		{
			move = this.moves[i];
			move.isActivie = move.isActivie && !this.board.isStill();
		}
	}

	private UpdateSwapping():void
	{
		var effect:SwapData;
		var isEmpty:Boolean = true;
		var numEffects:number = this.mSwapData.length;
		for ( var i:number = 0; i < numEffects; i++)
		{
			effect = this.mSwapData[i];
			effect.update();
			isEmpty = isEmpty && effect.isDone();
			this.badMove = this.badMove || effect.isBadSwap;
		}
		if (isEmpty)
			this.mSwapData.length = 0;
	}

	private updateFalling(gravityFactor:number):void
	{
		var aLastY:number;
		var aLastVelocity:number;
		var row:number;
		var col:number;
		var bird:Tile;
		var aGravity:number = Match3Logic.GRAVITY * gravityFactor;
		var aHitCout:number;
		this.birdsHit = false;
		for (col = 0; col < Board.BOARD_WIDTH; col++)
		{
			aLastY = Board.BOARD_HEIGHT;
			aLastVelocity = 0;
			row = Board.BOARD_HEIGHT - 1;
			for (; row >= 0; row--)
			{
				bird = this.board.getBird(row, col);
				if (bird != null)
				{
					if (bird.mIsSwapping || bird.isMatched)
						aLastY = bird.mRow;
					else
					{
						bird.mIsFalling = true;
						bird.mY += bird.mFallVelocity;
						if (bird.mY >= bird.mRow)
						{
							bird.mY = bird.mRow;
							if (bird.mFallVelocity >= Match3Logic.MIN_VELO_TO_HIT)
								aHitCout++;
							bird.mFallVelocity = 0;
							bird.mIsFalling = false;
						}
						else
						{
							if (bird.mY >= aLastY - 1)
							{
								bird.mY = aLastY - 1;
								bird.mFallVelocity = aLastVelocity;
							}
							else 
								bird.mFallVelocity += aGravity;
						}
						aLastY = bird.mY;
						aLastVelocity = bird.mFallVelocity;
					}
				}
			}
		}
		if (aHitCout > 0)
		{
			console.log(this.mLastHitTick, this.mUpdateCount);
		}
		if (aHitCout > 0 && Math.abs(this.mLastHitTick - this.mUpdateCount) > 8)
		{
			this.mLastHitTick = this.mUpdateCount;
			this.birdsHit = true;
		}
	}

	private updateMatches():void
	{
		var matchSet:MatchSet;
		var numMatches:number;
		var match:Match;
		var highestMoveId:number;
		var numBirds:number;
		var n:number;
		var bird:Tile;
		this.newMatchSets.length = 0;
		this.newMatches.length = 0;
		var sets:Array<MatchSet> = this.board.findMatches();
		var numSets:number = sets.length;
		for (var i:number = 0; i < numSets; i++)
		{
			matchSet = sets[i];
			if (matchSet.isDeferred == false)
			{
				this.newMatchSets.push(matchSet);
				numMatches = matchSet.mMatches.length;
				for (var k:number = 0; k < numMatches; k++)
				{
					match = matchSet.mMatches[k];
					match.mMatchId = this.matchCount;
					this.newMatches.push(match);
					this.matchCount++;
					highestMoveId = -1;
					numBirds = match.mBirds.length;
					for (n = 0; n < numBirds; n++)
					{
						bird = match.mBirds[n];
						bird.Match(match.mMatchId);
						highestMoveId = bird.moveId > highestMoveId ? bird.moveId : highestMoveId;
					}
					for (n = 0; n < numBirds; n++)
					{
						bird = match.mBirds[n];
						bird.moveId = highestMoveId;
					}
				}
			}
		}
	}

	private updateBirdPositions():void
	{
		var bird:Tile;
		var row:number;
		var col:number;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		this.grid.clearGrid();
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null)
			{
				row = (bird.mY + 0.5);
				col = (bird.mX + 0.5);
				this.grid.setBird(row, col, bird);
			}
		}
	}

	private UpdateLastHurrah():void
	{
		var specialCount:number;
		var delay:number;
		var row:number;
		var col:number;
		var bird:Tile;
		var move:MoveData;
		var isStill:boolean = this.board.isStill();

		if (this.isLastHurrah && isStill)
		{
			specialCount = 0;
			delay = this.mHurrahDelay;
			this.mHurrahDelay = Match3Logic.SHORT_HURRAH_DELAY;
			for (row = 0; row < Board.BOARD_HEIGHT; row++)
			{
				for (col = 0; col < Board.BOARD_WIDTH; col++)
				{
					bird = this.board.getBird(row, col);
					//if (bird.mType != Bird.TYPE_STANDARD)
					//{
						//move = new MoveData();
						//move.sourceBird = bird;
						//move.sourcePos.x = bird.mCol;
						//move.sourcePos.y = bird.mRow;
						//AddMove(move);
						//bird.fuseTime = delay;
						//bird.moveId = move.id;
						//bird.mShatterColor = bird.mColor;
						//bird.mShatterType = bird.mType;
						//delay = delay + 25;
						//specialCount++;
					//}
				}
			}
			if (specialCount == 0)
			{
				this.mGameOver = true;
				this.birdsHit = false;
			}
		}
		if (this.mGameTime == 0 && isStill)
		{
			this.mIsLastHurrah = true;
			//blazingSpeedBonus.Reset();
		}
	}

	private handleMatchedBirds():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null && bird.isMatching)
			{
				//starBirdLogic.handleMatchedBird(bird);
				//flameBirdLogic.handleMatchedBird(bird);
				//rainbowLogic.handleMatchedBird(bird);
				//multiLogic.handleMatchedBird(bird);
			}
		}
	}

	private handleDetonatedBirds():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null && bird.isDetonating)
			{
				//starBirdLogic.handleDetonatedBird(bird);
				//flameBirdLogic.handleDetonatedBird(bird);
				//rainbowLogic.handleDetonatedBird(bird);
				//multiLogic.handleDetonatedBird(bird);
				bird.Flush();
			}
		}
	}

	private handleShatteredBirds():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null && bird.isShattering)
			{
				//starBirdLogic.handleShatteredBird(bird);
				//flameBirdLogic.handleShatteredBird(bird);
				//rainbowLogic.handleShatteredBird(bird);
				//multiLogic.handleShatteredBird(bird);
			}
		}
	}

	private handleBirds():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null)
			{
				//multiLogic.handleBird(bird);
			}
		}
	}

	private propagateIds():void
	{
		var highestMatch:number;
		var highestMove:number;
		var colMatch:number;
		var colMove:number;
		var row:number;
		var bird:Tile;
		var numCols:number = this.board.numColumns;
		var numRows:number = this.board.numRows;
		var col:number;
		for ( col = 0; col < numCols; col++)
		{
			highestMatch = -1;
			highestMove = -1;
			colMatch = this.mColumnHighs[col].matchId;
			colMove = this.mColumnHighs[col].moveId;
			for (row = numRows - 1; row >= 0; row--)
			{
				bird = this.board.getBird(row, col);
				if (bird != null)
				{
					if (bird.isMatched || bird.isShattered || bird.mIsSwapping || bird.mIsFalling)
					{
						highestMatch = highestMatch > bird.mMatchId ? highestMatch : bird.mMatchId;
						highestMove = highestMove > bird.moveId ? highestMove : bird.moveId;
						colMatch = highestMatch > colMatch ? highestMatch : colMatch;
						colMove = highestMove > colMove ? highestMove : colMove;
					}
					if (highestMatch > bird.mMatchId)
						bird.mMatchId = highestMatch;
					if (highestMove > bird.moveId)
						bird.moveId = highestMove;
					if (bird.mY < -1)
					{
						bird.mMatchId = colMatch;
						bird.moveId = colMove;
					}
				}
			}
			this.mColumnHighs[col].matchId = colMatch;
			this.mColumnHighs[col].moveId = colMove;
		}
	}

	private resolveBirds():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for (var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null)
			{
				if (bird.isShattering)
					this.mPassiveEvents.push(new ShatterEvent(bird));
				else if (bird.isMatching)
				{
					this.mPassiveEvents.push(new MatchEvent(bird));
				}
				//if (mIsLastHurrah && bird.mType == Bird.TYPE_MULTI)
					//if (bird.fuseTime == 0 && bird.isFuseLit)
					//{
						//bird.ForceShatter(ture);
						//if (bird.isShattering)
							//mPassiveEvents.push(new ShatterEvent(bird));
					//}
			}
		}
	}

	private InitializeEvents():void
	{
		var e:IBirdEvent;
		for(let i:number = 0, len:number = this.mNewEvents.length; i < len; i++)
		{
			e= this.mNewEvents[i]
			e.Init();
		}
		this.mNewEvents.length = 0;
		
	}

	private clearBumps():void
	{
		var bird:Tile;
		var birdss:Array<Tile> = this.board.mBirds;
		var numBirds:number = birdss.length;
		for ( var i:number = 0; i < numBirds; i++)
		{
			bird = birdss[i];
			if (bird != null)
			{
				if (bird.mFallVelocity < 0)
					bird.mFallVelocity = 0;
			}
		}
	}

	private IsMoveLegal(bird:Tile, destRow:number, destCol:number):boolean
	{
		if (bird == null)
			return false;
		if (!bird.isStill())
			return false;
		var swapped:Tile = this.board.getBird(destRow, destCol);
		if (swapped != null && !swapped.isStill())
			return false;
		if (swapped == null)
			return false;
		var dirX:number = destCol - bird.mCol;
		var dirY:number = destRow - bird.mRow;
		if (Math.abs(dirX) + Math.abs(dirY) != 1)
			return false;
		return true;
	}

	private AddMove(move:MoveData):void
	{
		var nextId:number = this.moves.length;
		move.id = nextId;
		this.moves[nextId] = move;
	}

	private DoMove(move:MoveData):void
	{
		var sourceBird:Tile = move.sourceBird;
		var swapBird:Tile = move.swapBird;
		sourceBird.isSelected = false;
		if (swapBird.mIsSwapping || sourceBird.mIsSwapping)
			return;
		var triggerColor:number = Tile.COLOR_NONE;
		var hyperBird:Tile;
		if (sourceBird.mType == Tile.TYPE_RAINBOW && swapBird.mType == Tile.TYPE_RAINBOW)
		{
			hyperBird = sourceBird;
			sourceBird.mCol = Tile.COLOR_NONE;
			triggerColor = Tile.COLOR_NONE;
		}
		else if(sourceBird.mType == Tile.TYPE_RAINBOW)
		{
			hyperBird = sourceBird;
			triggerColor = swapBird.mColor;
		}
		this.AddMove(move);
		sourceBird.moveId = move.id;
		swapBird.moveId = move.id;
		if (hyperBird != null)
		{
			move.isSuccessful = true;
			hyperBird.mShatterColor = triggerColor;
			hyperBird.isShattering = true;
			return;
		}
		sourceBird.mIsSwapping = true;
		swapBird.mIsSwapping = true;
		this.startedMove = true;
		var swap:SwapData = new SwapData();
		swap.moveData = move;
		swap.board = this.board;
		swap.init();
		swap.speedFactor = this.mGameSpeed;
		this.mSwapData.push(swap);
	}

	public Quit():void
	{
		
	}

	public selectBird(row:number, col:number):void
	{
		if (this.mGameTime <= 0)
			return;
		if (row < 0 || row >= Board.BOARD_HEIGHT || col < 0 || col >= Board.BOARD_WIDTH)
			return;
		var clicked:Tile = this.board.getBird(row, col);
		if (clicked == null)
		{
			if (this.mSelected != null)
				this.mSelected.isSelected = false;
			this.mSelected = null;
			return;
		}
		if (!clicked.CanSelect())
			return;
		if (clicked == this.mSelected)
		{
			this.mFreshSelect = false;
			return;
		}
		if (this.mSelected == null)
		{
			this.mSelected = clicked;
			this.mSelected.isSelected = true;
			this.mFreshSelect = true;
			return;
		}
		if (!this.QueueMove(this.mSelected, row, col))
		{
			this.mSelected.isSelected = false;
			if (clicked != null)
			{
				this.mSelected = clicked;
				this.mSelected.isSelected = true;
				this.mFreshSelect = true;
				return;
			}
		}
		else
		{
			this.mSelected.isSelected = false;
			this.mSelected = null;
		}
	}

	public deselectBird(row:number, col:number):void
	{
		if (row < 0 || row >= Board.BOARD_HEIGHT || col < 0 || col >= Board.BOARD_WIDTH)
			return;
		var clicked:Tile = this.board.getBird(row, col);
		if (clicked == null)
		{
			if (this.mSelected != null)
				this.mSelected.isSelected = false;
			this.mSelected = null;
			return;
		}
		if (clicked == this.mSelected)
		{
			if (this.mFreshSelect)
				return;
			this.mSelected.isSelected = false;
			this.mSelected = null;
			return;
		}
	}

	private QueueMove(bird:Tile, destRow:number, destCol:number):boolean
	{
		if (this.mBlockingEvents.length > 0)
			return false;
		if (!this.IsMoveLegal(bird, destRow, destCol))
			return false;
		var move:MoveData = new MoveData();
		move.time = this.mUpdateCount;
		move.sourceBird = bird;
		move.sourcePos.x = bird.mCol;
		move.sourcePos.y = bird.mRow;
		move.isSwap = true;
		move.swapDir.x = destCol - bird.mCol;
		move.swapDir.y = destRow - bird.mRow;
		move.swapPos.x = destCol;
		move.swapPos.y = destRow;
		move.swapBird = this.board.getBird(destRow, destCol);
		this.mQueuedMoves.push(move);
		return true;
	}
	
	public AddPassiveEvent(event:IBirdEvent):void
	{
		this.mPassiveEvents.push(event);
		this.mNewEvents.push(event);
	}
	
}