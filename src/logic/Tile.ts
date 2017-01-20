class Tile 
{
	public static COLOR_NONE:number = 0;
	public static COLOR_RED:number = 1;
	public static COLOR_ORANGE:number = 2;
	public static COLOR_YELLOW:number = 3;
	public static COLOR_GREEN:number = 4;
	public static COLOR_BLUE:number = 5;
	public static COLOR_PURPLE:number = 6;
	public static COLOR_WHITE:number = 7;

	public static NUM_COLORS:number = 8;
	public static BIRD_COLORS:number[] = [Tile.COLOR_RED, 
								          Tile.COLOR_ORANGE, 
										  Tile.COLOR_YELLOW, 
										  Tile.COLOR_GREEN, 
										  Tile.COLOR_BLUE, 
										  Tile.COLOR_PURPLE, 
										  Tile.COLOR_WHITE];
	public static TYPE_STANDARD:number = 0;
	public static TYPE_MULTI:number = 1;
	public static TYPE_FLAME:number = 2;
	public static TYPE_RAINBOW:number = 3;
	public static TYPE_STAR:number = 4;
	
	public static ROTATE_SPEED:number = 0.3;
	public static IMMUNE_TIME:number = 25;
	
	public mShatterType:number;
	public mShatterColor:number;
	public mIsSwapping:boolean;
	public mIsFalling:boolean;
	public baseValue:number;
	public mRow:number;
	public mCol:number;
	public mImmuneTime:number;
	public mType:number;
	public mLifetime:number;
	public mBirdId:number;
	public mHasMove:boolean;
	public postFX:boolean;
	public mShatterBirdId:number;
	public mFallVelocity:number;
	public mX:number;
	public mY:number;
	public bonusValue:number;
	public mMatchId:number;
	public mIsElectric:boolean;
	public multiValue:number;
	public mIsHnumbered:boolean;
	public mRotateCount:number;
	public moveId:number;
	public mHasMatch:boolean;
	public mScale:number;
	public mColor:number;
	public mActiveCount:number;
	
	private mIsFuseLit:boolean;
	private mIsRotating:boolean;
	private mIsDetonating:boolean;
	private mIsMatching:boolean;
	private mIsMatched:boolean;
	private mIsDetonated:boolean
	private mIsShattered:boolean;
	private mIsDead:boolean;
	private mTrackForceShatter:boolean;
	private mFuseTime:number;
	private mIsShattering:boolean;
	private mIsSelected:boolean;
	
	public constructor() 
	{
	}

	public get isShattered():boolean
	{
		return this.mIsShattered;
	}
	
	public set isShattering(value:boolean)
	{
		this.mIsShattering = this.mIsShattering || (value && !this.mIsShattered && !this.mIsDead);
		this.mIsShattered = this.mIsShattered || value;
		this.mIsMatched = true;
		this.mIsMatching = false;
	}
	
	public get isShattering():boolean
	{
		return this.mIsShattering;
	}
	
	public get isDetonated():boolean
	{
		return this.mIsDetonated;
	}
	
	public set isDetonating(value:boolean)
	{
		this.mIsDetonating = this.mIsDetonating || (value && !this.mIsDetonated && !this.mIsDead);
		this.mIsDetonated = this.mIsDetonated  || value;
		this.mIsMatched = true;
		this.mIsMatching = false;
		this.mIsShattered = true;
		this.mIsShattering = false;
	}
	
	public get isDetonating():boolean
	{
		return this.mIsDetonating;
	}
	
	public set isRotating(value:boolean)
	{
		this.mIsRotating = false;
		this.mRotateCount = 0;//????
	}
	
	public get isRotating():boolean
	{
		return this.mIsRotating;
	}
	
	public set isDead(value:boolean)
	{
		this.mIsDead = value;
	}
	
	public get isDead():boolean
	{
		return this.mIsDead;
	}
	
	public set isMatching(value:boolean)
	{
		this.mIsMatching = this.mIsMatching || (value && !this.mIsMatched && !this.mIsDead);
		this.mIsMatched = this.mIsMatched || value;
	}
	
	public get isMatching():boolean
	{
		return this.mIsMatching;
	}
	
	public set isElectric(value:boolean)
	{
		if (this.mImmuneTime > 0)
			return;
		this.mIsMatching = false;
		this.mIsMatched = true;
		this.mIsElectric = true;
	}
	
	public get isElectric():boolean
	{
		return this.mIsElectric;
	}
	
	public get isMatched():boolean
	{
		return this.mIsMatched;
	}
	
	public set fuseTime(value:number)
	{
		if (this.mIsFuseLit || value <= 0)
			return;
		this.mIsShattered = true;//
		this.mIsShattering = false;
		this.mFuseTime = value;
		this.mIsFuseLit = true;
	}
	
	public get fuseTime():number{
		return this.mFuseTime;
	}
	
	public get isFuseLit():boolean
	{
		return this.mIsFuseLit;
	}
	
	public set isSelected(value:boolean)
	{
		this.mIsSelected = value;
		this.mIsRotating = this.mIsRotating || value;
	}
	
	public get isSelected():boolean
	{
		return this.mIsSelected;
	}
	
	public isIdle():boolean
	{
		return !this.mIsDead       && !this.mIsFalling    && !this.mIsMatching 
			&& !this.mIsShattering && !this.mIsDetonating && !this.mIsMatched 
			&& !this.mIsShattered  && !this.mIsDetonated  && this.mFuseTime == 0;
	}
	
	public upgrade(type:number, forced:boolean = false):void
	{
		if ( !forced && this.mType >= type)
			return;
		this.mLifetime = 0;
		this.mIsDead = false;
		this.mIsMatched = false;
		this.mIsMatching = false;
		this.mIsShattered = false;
		this.mIsShattering = false;
		this.mIsDetonated = false;
		this.mIsDetonating = false;
		this.mIsElectric = false;
		this.mImmuneTime = Tile .IMMUNE_TIME;
		this.mFuseTime = 0;
		this.mType = type;
		this.mTrackForceShatter = false;
	}
	
	public reset():void
	{
		this.postFX = false;
		this.mLifetime = 0;
		this.mType = Tile .TYPE_STANDARD;
		this.mIsDead = false;
		this.mIsElectric = false;
		this.mIsMatching = false;
		this.mIsShattering = false;
		this.mIsDetonating = false;
		this.mIsMatched = false;
		this.mIsShattered = false;
		this.mIsDetonated = false;
		this.mIsFalling = false;
		this.mIsSwapping = false;
		this.mHasMove = false;
		this.mImmuneTime = 0;
		this.mFuseTime = 0;
		this.mIsFuseLit = false;
		this.mIsRotating = false;
		this.mMatchId = -1;
		this.moveId = -1;
		this.mScale = 1;
		this.mColor = Tile.COLOR_NONE;
		this.mShatterColor = Tile.COLOR_NONE;
		this.mRow = -1;
		this.mCol = -1;
		this.mX = -1;
		this.mY = -1;
		this.mFallVelocity = 0;
		this.mTrackForceShatter = false;
	}
	
	public BenignDestory():void
	{
		this.mIsDetonated = true;
		this.mIsFuseLit = true;
	}
	
	public ForceShatter(track:boolean = false):void
	{
		if (track && this.mTrackForceShatter)
			return;
		this.mTrackForceShatter = track;
		this.isShattering = true;
		this.mIsShattering = true;
	}
	
	public isStill():boolean
	{
		return !this.mIsDead     && !this.mIsSwapping   && !this.mIsFalling 
		    && !this.mIsMatching && !this.mIsShattering && !this.mIsDetonating 
			&& !this.mIsMatched  && !this.mIsShattered  && !this.mIsDetonated  && this.mFuseTime == 0;
	}
	
	public Match(matchId:number):void
	{
		this.mMatchId = matchId;
		this.isMatching = true;
	}
	
	public Shatter(shatterTile:Tile):void
	{
		this.moveId = shatterTile.moveId;
		this.mShatterColor = shatterTile.mColor;
		this.mShatterType = shatterTile.mType;
		this.isShattering = true;
	}
	
	public CanSelect():boolean
	{
		return  !this.mIsDead &&
				!this.mIsMatched &&
				!this.mIsShattered &&
				!this.mIsDetonated;
				
	}
	
	public canMatch():boolean
	{
		return !this.mIsDead &&
			   !this.mIsSwapping &&
			   !this.mIsMatched &&
			   !this.mIsShattered &&
			   !this.mIsDetonated &&
			   this.mType != Tile .TYPE_RAINBOW;
				
	}
	
	public Flush():void
	{
		this.mIsMatching = false;
		this.mIsShattering = false;
		this.mIsDetonating = false;
	}
	
	public update():void
	{
		this.Flush();
		if (this.isDead)
			return;
		this.mLifetime++;
		if (this.mType == Tile .TYPE_RAINBOW || this.mIsRotating)
		{
			this.mRotateCount += Tile .ROTATE_SPEED;
			if (this.mRotateCount >= 20)
			{
				this.mRotateCount = 0;
				if (!this.mIsSelected)
					this.mIsRotating = false;
			}
		}
		else
		{
			this.mRotateCount = 0;
		}
		if (this.mImmuneTime > 0)
			this.mImmuneTime--;
		if (this.mFuseTime > 0)
		{
			this.mFuseTime--;
			if (this.mFuseTime == 0)
				this.isDetonating = true;
		}
	}
	
	public toString():string
	{
		var str:string = this.toIdstring() + "" + this.toColorstring();
		return str;
	}
	
	public toIdstring():string
	{
		return this.mRow + "" + this.mCol;
	}
	
	public toColorstring():string
	{
		switch(this.mColor)
		{
			case Tile.COLOR_RED:
				return "r";
			case Tile.COLOR_ORANGE:
				return ("o");
			case Tile.COLOR_YELLOW:
				return ("y");
			case Tile.COLOR_GREEN:
				return ("g");
			case Tile.COLOR_BLUE:
				return ("b");
			case Tile.COLOR_PURPLE:
				return ("p");
			case Tile.COLOR_WHITE:
				return ("w");
			default:
				return ("-");
		}
	}
	
	public   toDetailstring():string
	{
		var str:string = "Bird details:\n";
		str = "  Dead? " + this.mIsDead + "\n";
		str = "  Swapping? " + this.mIsSwapping + "\n";
		str = "  Falling? " + this.mIsFalling + "\n";
		str = "  Matching? " + this.mIsMatching + "\n";
		str = "  Shattering? " + this.mIsShattering + "\n";
		str = "  Detonating? " + this.mIsDetonating + "\n";
		str = "  Matched? " + this.mIsMatched + "\n";
		str = "  Shattered? " + this.mIsShattered + "\n";
		str = "  Detonated? " + this.mIsDetonated + "\n";
		str = "  Fuse Time: " + this.mFuseTime + "\n";
		str = "  Immune Time: " + this.mImmuneTime + "\n";
		return str;
	}
}