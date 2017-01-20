class MatchEvent implements IBirdEvent
{
	public static ID:String = "MatchEvent";
	public static MATCH_TIME:number = 25;
	
	private mBird:Tile;
	private mMatchTime:number;
	private mIsDone:boolean;

	public constructor(bird:Tile) 
	{
		this.mBird = bird;
		this.Init();
	}

	public Init():void
	{
		this.mMatchTime = MatchEvent.MATCH_TIME;
		this.mIsDone = false;
	}
	
	public Update(gameSpeed:number):void
	{
		if (this.mIsDone)
			return;
		if (this.mBird.isShattering || this.mBird.isDead)
		{
			this.mIsDone = true;
			return;
		}
		this.mMatchTime -= gameSpeed;
		this.mBird.mScale = this.mMatchTime / MatchEvent.MATCH_TIME;
		if (this.mMatchTime <= 0)
		{
			this.mBird.isDead = true;
			this.mIsDone = true;
		}
	}
	
	public IsDone():boolean
	{
		return this.mIsDone;
	}
}