class ShatterEvent implements IBirdEvent
{
	public static ID:string = "ShatterEvent";
		
	private mBird:Tile;
	private mIsDone:boolean;

	public constructor(bird:Tile) 
	{
		//super(ShatterEvent.ID)
		this.mBird = bird;
	}

	public Init():void
	{
		
	}
	
	public Update(gameSpeed:number):void
	{
		if (this.mIsDone)
			return;
		this.mBird.isDead = true;
		this.mIsDone = true;
	}
	
	public IsDone():boolean
	{
		return this.mIsDone;
	}
}