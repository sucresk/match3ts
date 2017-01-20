class Matcher 
{
	public static MIN_MATCH:number = 3;

	private mBirds:Tile[];
	private mLast:Tile;
	private mSize:number;

	public constructor() 
	{
		this.mBirds = [];
	}

	public push(newBird:Tile):Match
	{
		var aMatch:Match;
		if (newBird == null || !newBird.canMatch())
		{
			aMatch = this.end();
			this.start(null);
			return aMatch;
		}
		if (this.mLast == null)
		{
			this.start(newBird);
			return null;
		}
		if (newBird.mColor != this.mLast.mColor)
		{
			aMatch = this.end();
			this.start(newBird);
			return aMatch;
		}
		this.mBirds[this.mSize] = newBird;
		this.mLast = newBird;
		this.mSize++;
		return null;
	}
	
	public start(newBird:Tile):void
	{
		if (newBird == null || newBird.mType == Tile.TYPE_RAINBOW)
		{
			this.mLast = null;
			this.mSize = 0;
			return;
		}
		this.mBirds[0] = newBird;
		this.mLast = newBird;
		this.mSize = 1;
	}
	
	public end():Match
	{
		var birds:Tile[];
		var match:Match;
		if (this.mSize >= Matcher.MIN_MATCH)
		{
			birds = this.mBirds.slice(0, this.mSize);
			match = new Match();
			match.init(birds);
			return match;
		}
		return null;
	}
	
	public Reset():void
	{
		this.mBirds.length = 0;
		this.mLast = null;
		this.mSize = 0;
	}
}